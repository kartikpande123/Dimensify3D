import React, { useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";
import { CuraWASM } from "cura-wasm";
import { resolveDefinition } from "cura-wasm-definitions";
import { Container, Row, Col, Card, Button, Form, Badge, Alert, ProgressBar, Modal, Collapse } from 'react-bootstrap';
import Header from "./Header"
import "./slicer.css"

// Maximum allowed dimensions (in mm)
const MAX_DIMENSIONS = {
  width: 220,
  height: 220,
  depth: 250
};

// STL Model Viewer Component
const STLModel = ({ file, position, rotation, onDimensionsLoad }) => {
  const geometry = useLoader(STLLoader, file);
  geometry.computeBoundingBox();

  // Get dimensions
  const size = new THREE.Vector3();
  geometry.boundingBox.getSize(size);

  // Pass dimensions to parent component
  React.useEffect(() => {
    if (onDimensionsLoad) {
      onDimensionsLoad({
        width: size.x.toFixed(2),
        height: size.z.toFixed(2), // Z is height in 3D space
        depth: size.y.toFixed(2)
      });
    }
  }, [size.x, size.y, size.z, onDimensionsLoad]);

  // Center the model (X/Y in middle of plate, Z so bottom touches plate)
  const center = new THREE.Vector3();
  geometry.boundingBox.getCenter(center);
  geometry.translate(-center.x, -center.y, -geometry.boundingBox.min.z);

  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={[
        rotation[0] - Math.PI / 2, // upright orientation
        rotation[1],
        rotation[2],
      ]}
    >
      <meshStandardMaterial color="#2a65c5" />
    </mesh>
  );
};

// Helper to build overrides with correct format
function buildOverrides(user) {
  const overrides = [
    { scope: undefined, key: "speed_print", value: 80 },
    { scope: undefined, key: "material_bed_temperature", value: 70 },
    { scope: undefined, key: "material_print_temperature", value: 210 },
  ];

  if (user.layerHeight && user.layerHeight !== 0.15) {
    overrides.push({ scope: undefined, key: "layer_height", value: user.layerHeight });
    overrides.push({ scope: undefined, key: "initial_layer_height", value: user.layerHeight * 1.5 });
  } else if (user.layerHeight === 0.15) {
    overrides.push({ scope: undefined, key: "layer_height", value: 0.15 });
    overrides.push({ scope: undefined, key: "initial_layer_height", value: 0.2 });
  }
  
  if (user.infillDensity !== undefined && user.infillDensity !== null) {
    overrides.push({ scope: undefined, key: "infill_sparse_density", value: user.infillDensity });
  } else {
    overrides.push({ scope: undefined, key: "infill_sparse_density", value: 20 });
  }
  
  if (user.infillPattern) {
    overrides.push({ scope: undefined, key: "infill_pattern", value: user.infillPattern });
  }
  
  if (user.supportEnable !== undefined) {
    overrides.push({ scope: undefined, key: "support_enable", value: user.supportEnable });
    if (user.supportEnable) {
      overrides.push({ scope: undefined, key: "support_type", value: "buildplate" });
      overrides.push({ scope: undefined, key: "support_angle", value: 50 });
      overrides.push({ scope: undefined, key: "support_infill_rate", value: 15 });
    }
  }

  if (user.materialType) {
    switch (user.materialType.toLowerCase()) {
      case "pla":
        overrides.push({ scope: undefined, key: "material_print_temperature", value: 210 });
        overrides.push({ scope: undefined, key: "material_bed_temperature", value: 60 });
        overrides.push({ scope: undefined, key: "retraction_amount", value: 6.5 });
        overrides.push({ scope: undefined, key: "speed_print", value: 80 });
        break;
      case "pla+":
        overrides.push({ scope: undefined, key: "material_print_temperature", value: 220 });
        overrides.push({ scope: undefined, key: "material_bed_temperature", value: 70 });
        overrides.push({ scope: undefined, key: "retraction_amount", value: 6.5 });
        overrides.push({ scope: undefined, key: "speed_print", value: 75 });
        break;
      case "abs":
        overrides.push({ scope: undefined, key: "material_print_temperature", value: 250 });
        overrides.push({ scope: undefined, key: "material_bed_temperature", value: 100 });
        overrides.push({ scope: undefined, key: "retraction_amount", value: 4.5 });
        overrides.push({ scope: undefined, key: "speed_print", value: 70 });
        break;
      default:
        break;
    }
  }

  if (user.materialColor) {
    overrides.push({ scope: undefined, key: "material_colour", value: user.materialColor });
  }

  overrides.push({ scope: undefined, key: "retraction_enable", value: true });
  overrides.push({ scope: undefined, key: "wall_line_count", value: 3 });
  overrides.push({ scope: undefined, key: "top_layers", value: 4 });
  overrides.push({ scope: undefined, key: "bottom_layers", value: 3 });
  overrides.push({ scope: undefined, key: "adhesion_type", value: "skirt" });

  return overrides;
}

const STLSlicer = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [stlDimensions, setStlDimensions] = useState(null); 
  const [dimensionsValid, setDimensionsValid] = useState(true);
  const [printInfo, setPrintInfo] = useState(null);
  const [error, setError] = useState("");
  const [isSlicing, setIsSlicing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Model state for viewer
  const [modelPosition, setModelPosition] = useState([0, 0, 0]);
  const [modelRotation, setModelRotation] = useState([0, 0, 0]);

  // Simplified user settings focusing on the 6 main parameters
  const [userSettings, setUserSettings] = useState({
    layerHeight: 0.15,
    infillDensity: 20,
    infillPattern: "grid",
    supportEnable: false,
    materialType: "pla",
    materialColor: "blue",
  });

  // New states for quantity and special notes
  const [quantity, setQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState("");

  // Layer height options
  const layerHeightOptions = [
    { value: 0.06, label: "Extra Fine (0.06mm)" },
    { value: 0.1, label: "Fine (0.1mm)" },
    { value: 0.15, label: "Normal (0.15mm)" },
    { value: 0.2, label: "Fast (0.2mm)" },
    { value: 0.3, label: "Very Fast (0.3mm)" },
  ];

  // Material type options with auto-color assignment
  const materialOptions = [
    { value: "pla", label: "PLA", color: "blue" },
    { value: "pla+", label: "PLA+", color: "grey" },
    { value: "abs", label: "ABS", color: "yellow" },
  ];

  // Infill percentage options
  const infillOptions = [20, 40, 60, 80, 100];

  // Function to check if dimensions are within limits
  const validateDimensions = (dimensions) => {
    if (!dimensions) return true;
    
    const width = parseFloat(dimensions.width);
    const height = parseFloat(dimensions.height);
    const depth = parseFloat(dimensions.depth);
    
    return (
      width <= MAX_DIMENSIONS.width &&
      height <= MAX_DIMENSIONS.height &&
      depth <= MAX_DIMENSIONS.depth
    );
  };

  // Function to get filament correction factor
  const getFilamentCorrectionFactor = (materialType, infillDensity, supportEnable) => {
    const material = materialType.toLowerCase();
    
    if (supportEnable) {
      if (material === "pla" || material === "pla+") {
        return 0.64;
      } else if (material === "abs") {
        return 0.71;
      }
    } else {
      if (material === "pla" || material === "pla+") {
        switch (infillDensity) {
          case 20: return 1.62;
          case 40: return 1.0;
          case 60: return 0.72;
          case 80: return 0.56;
          case 100: return 0.49;
          default: return 1.0;
        }
      } else if (material === "abs") {
        switch (infillDensity) {
          case 20: return 1.5;
          case 40: return 0.96;
          case 60: return 0.69;
          case 80: return 0.54;
          case 100: return 0.47;
          default: return 1.0;
        }
      }
    }
    
    return 1.0;
  };

  const calculatePrice = (filamentGrams, estimatedTimeSeconds) => {
    console.log("=== 3D PRINT PRICING CALCULATION ===");
    
    const roundedFilamentGrams = Math.ceil(filamentGrams);
    console.log(`Original filament weight: ${filamentGrams}g`);
    console.log(`Rounded filament weight: ${roundedFilamentGrams}g`);
    
    const timeInHours = estimatedTimeSeconds / 3600;
    const roundedHours = Math.ceil(timeInHours);
    console.log(`Original time: ${timeInHours.toFixed(2)} hours`);
    console.log(`Rounded time: ${roundedHours} hours`);
    
    const filamentCost = roundedFilamentGrams * 1;
    const timeCost = roundedHours * 2;
    const packagingCost = 15;
    
    console.log(`Filament cost: ${filamentCost} Rs (${roundedFilamentGrams}g × 1 Rs/g)`);
    console.log(`Time cost: ${timeCost} Rs (${roundedHours}h × 2 Rs/h)`);
    console.log(`Packaging cost: ${packagingCost} Rs (fixed)`);
    
    const subtotal = filamentCost + timeCost + packagingCost;
    console.log(`Subtotal: ${subtotal} Rs`);
    
    const humanEffortsCost = subtotal * 0.10;
    console.log(`Human efforts (10%): ${humanEffortsCost} Rs`);
    
    const totalBeforeProfit = subtotal + humanEffortsCost;
    console.log(`Total before profit: ${totalBeforeProfit} Rs`);
    
    const profitCost = subtotal * 0.25;
    console.log(`Profit (25% of base costs): ${profitCost} Rs`);
    
    const finalPrice = totalBeforeProfit + profitCost;
    console.log(`Final price: ${finalPrice} Rs`);
    console.log("=====================================");
    
    return {
      filamentCost,
      timeCost,
      packagingCost,
      humanEffortsCost,
      profitCost,
      finalPrice: Math.round(finalPrice),
      breakdown: {
        filamentGrams: roundedFilamentGrams,
        hours: roundedHours,
        subtotal,
        totalBeforeProfit,
        finalPrice: Math.round(finalPrice)
      }
    };
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith(".stl")) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
      setPrintInfo(null);
      setError("");
      setStlDimensions(null);
      setDimensionsValid(true);
      setModelPosition([0, 0, 0]);
      setModelRotation([0, 0, 0]);
    } else {
      setError("Please select a valid STL file");
    }
  };

  const handleDimensionsLoad = (dimensions) => {
    setStlDimensions(dimensions);
    const isValid = validateDimensions(dimensions);
    setDimensionsValid(isValid);
    
    if (!isValid) {
      setError("STL file dimensions exceed maximum allowed limits. Please resize your model or split it into smaller parts.");
    } else {
      setError("");
    }
  };

  const handleSettingChange = (key, value) => {
    let newSettings = { ...userSettings, [key]: value };
    
    if (key === 'materialType') {
      const selectedMaterial = materialOptions.find(m => m.value === value);
      if (selectedMaterial) {
        newSettings.materialColor = selectedMaterial.color;
      }
    }
    
    setUserSettings(newSettings);
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds === "N/A") return "N/A";
    const numSeconds = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
    if (isNaN(numSeconds)) return "N/A";
    
    const hrs = Math.floor(numSeconds / 3600);
    const mins = Math.floor((numSeconds % 3600) / 60);
    const secs = Math.floor(numSeconds % 60);
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const sliceFile = async () => {
    if (!file) {
      setError("Please select an STL file first");
      return;
    }

    if (!dimensionsValid) {
      setError("Cannot slice file: STL dimensions exceed maximum limits");
      return;
    }

    setIsSlicing(true);
    setProgress(0);
    setError("");

    try {
      console.log("Building overrides with settings:", userSettings);
      const overrides = buildOverrides(userSettings);
      console.log("Generated overrides:", overrides);
      
      const infillOverride = overrides.find(o => o.key === "infill_sparse_density");
      console.log("Infill override found:", infillOverride);

      const slicer = new CuraWASM({
        definition: resolveDefinition("ultimaker2"),
        overrides: overrides,
        verbose: true,
      });

      slicer.on('progress', (percent) => {
        setProgress(percent);
        console.log(`Slicing progress: ${percent}%`);
      });

      const arrayBuffer = await file.arrayBuffer();
      console.log("Starting slice operation...");
      
      const result = await slicer.slice(arrayBuffer, "stl");

      console.log("Slice completed!");
      console.log("Generated G-code length:", result.gcode?.length || 0);
      console.log("Metadata:", result.metadata);

      if (result.metadata) {
        const filamentMm = result.metadata.filamentUsage || 
                          result.metadata.material1Usage || 
                          result.metadata.filament_used || 0;

        let materialDensity = 1.24;
        switch (userSettings.materialType?.toLowerCase()) {
          case "pla":
            materialDensity = 1.24;
            break;
          case "pla+":
            materialDensity = 1.25;
            break;
          case "abs":
            materialDensity = 1.05;
            break;
          default:
            materialDensity = 1.24;
        }

        const filamentGrams = (filamentMm / 1000) * materialDensity;

        const correctionFactor = getFilamentCorrectionFactor(
          userSettings.materialType, 
          userSettings.infillDensity, 
          userSettings.supportEnable
        );
        const correctedFilamentGrams = filamentGrams / correctionFactor;

        console.log(`Correction factor applied: ${correctionFactor}`);
        console.log(`Original weight: ${filamentGrams.toFixed(2)}g, Corrected: ${correctedFilamentGrams.toFixed(2)}g`);

        const info = {
          filamentUsedMm: filamentMm,
          filamentUsedGrams: correctedFilamentGrams.toFixed(2),
          volume: result.metadata.volume || "N/A",
          height: result.metadata.height || stlDimensions?.height || "N/A", 
          width: result.metadata.width || stlDimensions?.width || "N/A",
          depth: result.metadata.depth || stlDimensions?.depth || "N/A",
          materialType: userSettings.materialType.toUpperCase(),
          materialColor: userSettings.materialColor,
          layerHeight: userSettings.layerHeight,
          infillDensity: userSettings.infillDensity,
        };

        const timeInSeconds = result.metadata.printTime || result.metadata.print_time || result.metadata.estimated_time || 0;
        const pricing = calculatePrice(correctedFilamentGrams, timeInSeconds);
        
        info.pricing = pricing;
        
        console.log("=== PRINT ANALYSIS COMPLETE ===");
        console.log(`- Filament Used: ${(info.filamentUsedMm / 1000).toFixed(2)} m`);
        console.log(`- Filament Weight: ${info.filamentUsedGrams} g`);
        console.log("Model Dimensions:");
        console.log(`- Height: ${info.height} mm`);
        console.log(`- Width: ${info.width} mm`);
        console.log(`- Depth: ${info.depth} mm`);
        console.log(`- Volume: ${info.volume} mm³`);
        console.log("Settings Used:");
        console.log(`- Material: ${info.materialType} (${info.materialColor})`);
        console.log(`- Layer Height: ${info.layerHeight}mm`);
        console.log(`- Infill Density: ${info.infillDensity}%`);
        console.log("===============================");
        
        setPrintInfo(info);
      } else {
        console.warn("No metadata received from slicing operation");
        const defaultInfo = {
          filamentUsedMm: "N/A", 
          filamentUsedGrams: "N/A",
          volume: "N/A",
          height: stlDimensions?.height || "N/A",
          width: stlDimensions?.width || "N/A",
          depth: stlDimensions?.depth || "N/A",
          materialType: userSettings.materialType.toUpperCase(),
          materialColor: userSettings.materialColor,
          layerHeight: userSettings.layerHeight,
          infillDensity: userSettings.infillDensity,
        };

        const pricing = calculatePrice(0, 0);
        defaultInfo.pricing = pricing;
        
        setPrintInfo(defaultInfo);
      }

      slicer.dispose();

    } catch (err) {
      console.error("Slicing error:", err);
      setError(`Slicing failed: ${err.message}`);
    } finally {
      setIsSlicing(false);
      setProgress(0);
    }
  };

  const handlePayNow = () => {
    const totalPrice = printInfo.pricing.finalPrice * quantity;

    const checkoutData = {
      stlFile: {
        name: file?.name,
        url: fileUrl
      },
      printSettings: {
        layerHeight: userSettings.layerHeight,
        infillDensity: userSettings.infillDensity,
        infillPattern: userSettings.infillPattern,
        supportEnable: userSettings.supportEnable,
        materialType: userSettings.materialType,
        materialColor: userSettings.materialColor
      },
      modelControls: {
        position: {
          x: modelPosition[0],
          y: modelPosition[1],
          z: modelPosition[2]
        },
        rotation: {
          x: modelRotation[0],
          y: modelRotation[1],
          z: modelRotation[2],
          xDegrees: modelRotation[0] * (180 / Math.PI),
          yDegrees: modelRotation[1] * (180 / Math.PI),
          zDegrees: modelRotation[2] * (180 / Math.PI)
        }
      },
      dimensions: {
        height: printInfo?.height || stlDimensions?.height || "N/A",
        width: printInfo?.width || stlDimensions?.width || "N/A",
        depth: printInfo?.depth || stlDimensions?.depth || "N/A"
      },
      pricing: printInfo?.pricing,
      printDetails: {
        filamentUsedGrams: printInfo?.filamentUsedGrams
      },
      quantity: quantity,
      specialNotes: specialNotes,
      unitPrice: printInfo.pricing.finalPrice,
      totalPrice: totalPrice
    };

    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    window.location.assign('/checkout');
  };

  return (
    <>
      <Header />
      
      <div style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e9edf2 25%, #dce2e8 50%, #cfd6dd 75%, #e9edf2 100%)', minHeight: '100vh', paddingTop: '2rem' }}>
        <Container fluid className="px-4">
          {/* Tutorial Banner */}
          <Row className="mb-4">
            <Col>
              <Card className="tutorial-banner border-0 professional-card">
                <Card.Body className="text-center py-3">
                  <p className="mb-0">
                    <i className="fas fa-question-circle me-2"></i>
                    Need help creating STL files? 
                    <Button 
                      variant="link" 
                      className="text-white fw-bold text-decoration-underline p-0 ms-2"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Would navigate to /stltut page");
                      }}
                    >
                      View Tutorial Guide
                    </Button>
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* File Selection & Maximum Dimensions - 50/50 Split */}
          <Row className="mb-4">
            {/* File Selection - 50% */}
            <Col lg={6}>
              <Card className="professional-card h-100">
                <Card.Body>
                  <h5 className="section-title">
                    <i className="fas fa-upload me-2"></i>Select STL File
                  </h5>
                  <div className="file-input-wrapper">
                    <input 
                      type="file" 
                      accept=".stl" 
                      onChange={handleFileSelect}
                      className="file-input-hidden"
                      id="stl-file-input"
                    />
                    <label htmlFor="stl-file-input" className="file-input-custom">
                      <i className="fas fa-cloud-upload-alt me-2"></i>
                      {file ? file.name : "Choose STL File"}
                    </label>
                  </div>
                  {file && (
                    <div className="mt-3 text-center">
                      <span className="info-badge">
                        <i className="fas fa-check-circle me-1"></i>
                        File Selected: {file.name}
                      </span>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            {/* Maximum Dimensions - 50% */}
            <Col lg={6}>
              <Card className="dimension-card-max professional-card h-100">
                <Card.Body>
                  <h5 className="text-center mb-4 fw-bold">
                    <i className="fas fa-cube me-2"></i>Maximum Print Dimensions
                  </h5>
                  <Row>
                    <Col md={4}>
                      <div className="dimension-stat">
                        <h6 className="mb-2 opacity-75">Max Height</h6>
                        <h3 className="fw-bold mb-0">{MAX_DIMENSIONS.height} mm</h3>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="dimension-stat">
                        <h6 className="mb-2 opacity-75">Max Width</h6>
                        <h3 className="fw-bold mb-0">{MAX_DIMENSIONS.width} mm</h3>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="dimension-stat">
                        <h6 className="mb-2 opacity-75">Max Depth</h6>
                        <h3 className="fw-bold mb-0">{MAX_DIMENSIONS.depth} mm</h3>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* STL File Dimensions & Max Dimensions Combined - Only show if file is selected */}
          {stlDimensions && (
            <Row className="mb-4">
              <Col>
                <Card className={`professional-card ${!dimensionsValid ? 'dimension-invalid' : 'dimension-card'}`} style={{ backgroundColor: '#e3f2fd' }}>
                  <Card.Body>
                    <h5 className="mb-4 fw-bold text-center">
                      <i className="fas fa-ruler-combined me-2"></i>
                      Model vs Maximum Dimensions {!dimensionsValid && '⚠️ EXCEEDS LIMITS'}
                    </h5>
                    <Row>
                      <Col md={4}>
                        <div className={`dimension-stat ${!dimensionsValid && parseFloat(stlDimensions.height) > MAX_DIMENSIONS.height ? 'invalid' : ''}`}>
                          <h6 className="mb-2 opacity-75">Height</h6>
                          <h3 className="fw-bold mb-1">{stlDimensions.height} mm</h3>
                          <small className="text-muted">Max: {MAX_DIMENSIONS.height} mm</small>
                          {parseFloat(stlDimensions.height) > MAX_DIMENSIONS.height && (
                            <div><small className="text-warning fw-bold">Exceeds limit!</small></div>
                          )}
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className={`dimension-stat ${!dimensionsValid && parseFloat(stlDimensions.width) > MAX_DIMENSIONS.width ? 'invalid' : ''}`}>
                          <h6 className="mb-2 opacity-75">Width</h6>
                          <h3 className="fw-bold mb-1">{stlDimensions.width} mm</h3>
                          <small className="text-muted">Max: {MAX_DIMENSIONS.width} mm</small>
                          {parseFloat(stlDimensions.width) > MAX_DIMENSIONS.width && (
                            <div><small className="text-warning fw-bold">Exceeds limit!</small></div>
                          )}
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className={`dimension-stat ${!dimensionsValid && parseFloat(stlDimensions.depth) > MAX_DIMENSIONS.depth ? 'invalid' : ''}`}>
                          <h6 className="mb-2 opacity-75">Depth</h6>
                          <h3 className="fw-bold mb-1">{stlDimensions.depth} mm</h3>
                          <small className="text-muted">Max: {MAX_DIMENSIONS.depth} mm</small>
                          {parseFloat(stlDimensions.depth) > MAX_DIMENSIONS.depth && (
                            <div><small className="text-warning fw-bold">Exceeds limit!</small></div>
                          )}
                        </div>
                      </Col>
                    </Row>
                    {!dimensionsValid && (
                      <Alert variant="danger" className="alert-professional mt-4">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Model Too Large!</strong> Please resize your STL file or split it into smaller parts that fit within the maximum dimensions.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* 3D Viewer & Model Controls - 50/50 Split - Only show if dimensions are valid */}
          {file && dimensionsValid && (
            <Row className="mb-4">
              {/* 3D Viewer - 50% */}
              <Col lg={6}>
                <Card className="professional-card h-100">
                  <Card.Body>
                    <h5 className="section-title">
                      <i className="fas fa-eye me-2"></i>3D Preview
                    </h5>
                    <div className="viewer-container" style={{ height: '400px' }}>
                      <Canvas shadows>
                        <PerspectiveCamera makeDefault position={[300, 300, 300]} fov={40} />
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[100, 200, 100]} intensity={1} castShadow />

                        {/* Plate */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                          <planeGeometry args={[220, 220]} />
                          <meshStandardMaterial color="#f8f9fa" />
                        </mesh>

                        {/* Model */}
                        {fileUrl && (
                          <STLModel 
                            file={fileUrl} 
                            position={modelPosition} 
                            rotation={modelRotation}
                            onDimensionsLoad={handleDimensionsLoad}
                          />
                        )}

                        <OrbitControls enablePan enableZoom enableRotate />
                      </Canvas>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Model Controls - 50% */}
              <Col lg={6}>
                <Card className="professional-card h-100">
                  <Card.Body>
                    <h5 className="section-title">
                      <i className="fas fa-sliders-h me-2"></i>Model Controls
                    </h5>
                    
                   {/* Move Controls */}
<div className="mb-4" style={{ border: '2px solid #2a65c5', borderRadius: '8px', padding: '1rem' }}>
  <h6 className="fw-semibold mb-3 text-muted">Position Adjustment</h6>
  <Row>
    {["X", "Y", "Z"].map((axis, index) => (
      <Col md={4} key={axis} className="mb-3">
        <div style={{ border: '1px solid #2a65c5', borderRadius: '6px', padding: '0.8rem' }}>
          <Form.Label className="fw-medium text-dark">
            {axis}: {modelPosition[index].toFixed(1)}mm
          </Form.Label>
          <Form.Range
            min={-100}
            max={100}
            step={1}
            value={modelPosition[index]}
            onChange={(e) => {
              const newPos = [...modelPosition];
              newPos[index] = parseFloat(e.target.value);
              setModelPosition(newPos);
            }}
            className="control-slider"
          />
        </div>
      </Col>
    ))}
  </Row>
</div>

{/* Rotate Controls */}
<div className="mb-4" style={{ border: '2px solid #2a65c5', borderRadius: '8px', padding: '1rem' }}>
  <h6 className="fw-semibold mb-3 text-muted">Rotation Adjustment</h6>
  <Row>
    {["X", "Y", "Z"].map((axis, index) => (
      <Col md={4} key={axis} className="mb-3">
        <div style={{ border: '1px solid #2a65c5', borderRadius: '6px', padding: '0.8rem' }}>
          <Form.Label className="fw-medium text-dark">
            {axis}: {(modelRotation[index] * (180 / Math.PI)).toFixed(0)}°
          </Form.Label>
          <Form.Range
            min={-180}
            max={180}
            step={1}
            value={modelRotation[index] * (180 / Math.PI)}
            onChange={(e) => {
              const newRot = [...modelRotation];
              newRot[index] = (parseFloat(e.target.value) * Math.PI) / 180;
              setModelRotation(newRot);
            }}
            className="control-slider"
          />
        </div>
      </Col>
    ))}
  </Row>
</div>

                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Print Configuration - Only show if dimensions are valid */}
          {dimensionsValid && (
            <Row className="mb-4">
              <Col>
                <Card className="professional-card settings-card">
                  <Card.Body>
                    <h5 className="section-title text-center">
                      <i className="fas fa-cogs me-2"></i>Print Configuration
                    </h5>
                    
                    <div className="settings-section">
                      <Row>
                        {/* Layer Height */}
                        <Col lg={4} md={6} className="mb-4">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              <i className="fas fa-layer-group me-2 text-primary"></i>Layer Height
                            </Form.Label>
                            <div className="position-relative">
                              <Form.Select
                                value={userSettings.layerHeight}
                                onChange={(e) => handleSettingChange('layerHeight', parseFloat(e.target.value))}
                                className="professional-form-control"
                                style={{ appearance: 'none', paddingRight: '2.5rem' }}
                              >
                                {layerHeightOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </Form.Select>
                              <i className="fas fa-chevron-down position-absolute top-50 end-0 translate-middle-y me-3 text-muted" style={{ pointerEvents: 'none' }}></i>
                            </div>
                          </Form.Group>
                        </Col>

                        {/* Infill Density */}
                        <Col lg={4} md={6} className="mb-4">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              <i className="fas fa-fill-drip me-2 text-primary"></i>Infill Density
                            </Form.Label>
                            <div className="position-relative">
                              <Form.Select
                                value={userSettings.infillDensity}
                                onChange={(e) => handleSettingChange('infillDensity', parseInt(e.target.value))}
                                className="professional-form-control"
                                style={{ appearance: 'none', paddingRight: '2.5rem' }}
                              >
                                {infillOptions.map(percentage => (
                                  <option key={percentage} value={percentage}>
                                    {percentage}% Fill
                                  </option>
                                ))}
                              </Form.Select>
                              <i className="fas fa-chevron-down position-absolute top-50 end-0 translate-middle-y me-3 text-muted" style={{ pointerEvents: 'none' }}></i>
                            </div>
                          </Form.Group>
                        </Col>

                        {/* Infill Pattern */}
                        <Col lg={4} md={6} className="mb-4">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              <i className="fas fa-th me-2 text-primary"></i>Infill Pattern
                            </Form.Label>
                            <div className="position-relative">
                              <Form.Select
                                value={userSettings.infillPattern}
                                onChange={(e) => handleSettingChange('infillPattern', e.target.value)}
                                className="professional-form-control"
                                style={{ appearance: 'none', paddingRight: '2.5rem' }}
                              >
                                <option value="grid">Grid Pattern</option>
                                <option value="lines">Linear Pattern</option>
                                <option value="triangles">Triangle Pattern</option>
                                <option value="cubic">Cubic Pattern</option>
                                <option value="concentric">Concentric Pattern</option>
                                <option value="zigzag">Zigzag Pattern</option>
                                <option value="gyroid">Gyroid Pattern</option>
                              </Form.Select>
                              <i className="fas fa-chevron-down position-absolute top-50 end-0 translate-middle-y me-3 text-muted" style={{ pointerEvents: 'none' }}></i>
                            </div>
                          </Form.Group>
                        </Col>

                        {/* Support Required */}
                        <Col lg={4} md={6} className="mb-4">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              <i className="fas fa-hands-helping me-2 text-primary"></i>Support Structure
                            </Form.Label>
                            <div className="d-flex gap-4 mt-2">
                              <Form.Check
                                type="radio"
                                label="Not Required"
                                name="support"
                                checked={!userSettings.supportEnable}
                                onChange={() => handleSettingChange('supportEnable', false)}
                                className="fw-medium"
                              />
                              <Form.Check
                                type="radio"
                                label="Required"
                                name="support"
                                checked={userSettings.supportEnable}
                                onChange={() => handleSettingChange('supportEnable', true)}
                                className="fw-medium"
                              />
                            </div>
                          </Form.Group>
                        </Col>

                        {/* Material Type */}
                        <Col lg={4} md={6} className="mb-4">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              <i className="fas fa-cube me-2 text-primary"></i>Material Type
                            </Form.Label>
                            <div className="position-relative">
                              <Form.Select
                                value={userSettings.materialType}
                                onChange={(e) => handleSettingChange('materialType', e.target.value)}
                                className="professional-form-control"
                                style={{ appearance: 'none', paddingRight: '2.5rem' }}
                              >
                                {materialOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label} Filament
                                  </option>
                                ))}
                              </Form.Select>
                              <i className="fas fa-chevron-down position-absolute top-50 end-0 translate-middle-y me-3 text-muted" style={{ pointerEvents: 'none' }}></i>
                            </div>
                          </Form.Group>
                        </Col>

                        {/* Material Color */}
                        <Col lg={4} md={6} className="mb-4">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              <i className="fas fa-palette me-2 text-primary"></i>Material Color
                            </Form.Label>
                            <div className="d-flex align-items-center mt-2">
                              <div 
                                className="color-indicator"
                                style={{ backgroundColor: userSettings.materialColor }}
                              ></div>
                              <span className="fw-medium text-capitalize">
                                {userSettings.materialColor} Color
                              </span>
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Quantity and Special Notes Section - Only show after slicing */}
                      {printInfo && (
                        <div className="mt-4 pt-4" style={{borderTop: '2px solid rgba(42, 101, 197, 0.1)'}}>
                          <h6 className="fw-bold mb-3 text-primary">
                            <i className="fas fa-plus-circle me-2"></i>Order Configuration
                          </h6>
                          <Row>
                            {/* Quantity */}
                            <Col md={6} className="mb-3">
                              <Form.Group>
                                <Form.Label className="fw-semibold text-dark">
                                  <i className="fas fa-sort-numeric-up me-2 text-primary"></i>Quantity
                                </Form.Label>
                                <div className="d-flex align-items-center gap-3 mt-2">
                                  <Button
                                    variant="outline-secondary"
                                    className="quantity-control"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                  >
                                    -
                                  </Button>
                                  <span className="fw-bold fs-4 text-primary" style={{ minWidth: '3rem', textAlign: 'center' }}>
                                    {quantity}
                                  </span>
                                  <Button
                                    variant="outline-secondary"
                                    className="quantity-control"
                                    onClick={() => setQuantity(quantity + 1)}
                                  >
                                    +
                                  </Button>
                                </div>
                                <Form.Text className="text-muted fw-medium">
                                  Minimum order quantity: 1 piece
                                </Form.Text>
                              </Form.Group>
                            </Col>

                            {/* Special Notes */}
                            <Col md={6} className="mb-3">
                              <Form.Group>
                                <Form.Label className="fw-semibold text-dark">
                                  <i className="fas fa-sticky-note me-2 text-primary"></i>Special Instructions
                                </Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  value={specialNotes}
                                  onChange={(e) => setSpecialNotes(e.target.value)}
                                  placeholder="Any special requirements or instructions..."
                                  className="professional-form-control"
                                  maxLength={500}
                                />
                                <Form.Text className="text-muted fw-medium">
                                  {specialNotes.length}/500 characters remaining
                                </Form.Text>
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
          
          {/* Slice Button */}
          <Row className="mb-4">
            <Col>
              <div className="d-grid">
                <Button 
                  onClick={sliceFile}
                  disabled={!file || isSlicing || !dimensionsValid}
                  className={`py-3 fw-bold ${!file || isSlicing || !dimensionsValid ? '' : 'professional-button'}`}
                  size="lg"
                  style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}
                >
                  <i className="fas fa-magic me-2"></i>
                  {isSlicing ? `Analyzing Model... ${progress}%` : 
                   !dimensionsValid ? 'Cannot Process - Model Too Large' : 
                   'Analyze & Generate Quote'}
                </Button>
              </div>
              {!dimensionsValid && (
                <p className="text-center text-danger mt-3 fw-medium">
                  <i className="fas fa-info-circle me-2"></i>
                  Please upload an STL file within the maximum dimensions to continue.
                </p>
              )}
            </Col>
          </Row>

          {/* Progress Bar */}
          {isSlicing && (
            <Row className="mb-4">
              <Col>
                <Card className="professional-card">
                  <Card.Body>
                    <div className="progress-professional mb-3">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-muted mb-0 fw-medium">
                      <i className="fas fa-spinner fa-spin me-2 text-primary"></i>
                      Processing your 3D model... {progress}% complete
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Error Display */}
          {error && (
            <Row className="mb-4">
              <Col>
                <Alert variant="danger" className="alert-professional">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  <strong>Processing Error:</strong> {error}
                </Alert>
              </Col>
            </Row>
          )}

          {/* Print Information - Show Price with Quantity */}
          {printInfo && (
            <Row className="mb-5">
              <Col>
                <Card className="pricing-card professional-card">
                  <Card.Body className="pricing-content text-center">
                    <h3 className="fw-bold mb-4 text-success">
                      <i className="fas fa-check-circle me-2"></i>
                      Analysis Complete!
                    </h3>
                    
                    <Row className="justify-content-center">
                      <Col lg={10}>
                        <Card className="border-0 shadow-sm mb-4" style={{ background: 'rgba(255,255,255,0.95)' }}>
                          <Card.Body>
                            {/* Single Unit Price */}
                            <div className="mb-4">
                              <p className="h6 text-muted mb-2 fw-medium">Manufacturing cost per Unit:</p>
                              <h2 className="display-4 fw-bold price-highlight mb-0">
                                ₹{printInfo.pricing.finalPrice}
                              </h2>
                            </div>
                            
                            {/* Quantity Display */}
                            {quantity > 1 && (
                              <Alert variant="info" className="alert-professional mb-4">
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="fw-medium">
                                    <i className="fas fa-calculator me-2"></i>
                                    Quantity: {quantity} units
                                  </span>
                                  <span className="fw-bold">
                                    {quantity} × ₹{printInfo.pricing.finalPrice} = ₹{printInfo.pricing.finalPrice * quantity}
                                  </span>
                                </div>
                              </Alert>
                            )}

                            {/* Total Price */}
                            <div className="mb-4">
                              <p className="h6 text-muted mb-2 fw-medium">Total Cost(Excluding Delivery fees):</p>
                              <h1 className="display-3 fw-bold text-success mb-4">
                                ₹{printInfo.pricing.finalPrice * quantity}
                              </h1>
                            </div>

                            {/* Print Details Summary - Removed Material Usage and Material sections */}
                            {/* No material details displayed here anymore */}

                            {/* Special Notes Display */}
                            {specialNotes.trim() && (
                              <Alert variant="warning" className="alert-professional mb-4">
                                <p className="fw-bold mb-2">
                                  <i className="fas fa-sticky-note me-2"></i>Special Instructions:
                                </p>
                                <p className="mb-0 fst-italic">"{specialNotes}"</p>
                              </Alert>
                            )}

                            <Button 
                              onClick={handlePayNow}
                              className="order-button"
                              size="lg"
                            >
                              <i className="fas fa-shopping-cart me-2"></i>
                              Place Order Now
                            </Button>
                            
                            <div className="mt-3">
                              <small className="text-muted">
                                <i className="fas fa-shield-alt me-1"></i>
                                Secure checkout • Professional quality guarantee
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </>
  );
};

export default STLSlicer;