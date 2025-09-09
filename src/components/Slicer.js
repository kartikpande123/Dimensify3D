import React, { useState } from "react";
import { CuraWASM } from "cura-wasm";
import { resolveDefinition } from "cura-wasm-definitions";

// 🔧 Helper to build overrides with correct format
function buildOverrides(user) {
  // Base overrides with default values - ALWAYS include infill density
  const overrides = [
    { scope: undefined, key: "speed_print", value: 80 }, // Default print speed
    { scope: undefined, key: "material_bed_temperature", value: 70 }, // Default bed temp
    { scope: undefined, key: "material_print_temperature", value: 210 }, // Default nozzle temp
    // CRITICAL: Always set infill density first
    { scope: undefined, key: "infill_sparse_density", value: user.infillDensity || 20 },
  ];

  // 1. Layer Height - Override only if user selects non-default
  if (user.layerHeight && user.layerHeight !== 0.15) {
    overrides.push({ scope: undefined, key: "layer_height", value: user.layerHeight });
    // Adjust initial layer height proportionally
    overrides.push({ scope: undefined, key: "initial_layer_height", value: user.layerHeight * 1.5 });
  } else if (user.layerHeight === 0.15) {
    // Explicitly set default if selected
    overrides.push({ scope: undefined, key: "layer_height", value: 0.15 });
    overrides.push({ scope: undefined, key: "initial_layer_height", value: 0.2 });
  }
  
  // 2. Infill Pattern - Override if specified
  if (user.infillPattern) {
    overrides.push({ scope: undefined, key: "infill_pattern", value: user.infillPattern });
  }
  
  // 3. Support Enable - Override if specified
  if (user.supportEnable !== undefined) {
    overrides.push({ scope: undefined, key: "support_enable", value: user.supportEnable });
    if (user.supportEnable) {
      overrides.push({ scope: undefined, key: "support_type", value: "buildplate" });
      overrides.push({ scope: undefined, key: "support_angle", value: 50 });
      overrides.push({ scope: undefined, key: "support_infill_rate", value: 15 });
    }
  }

  // 4. Material Type - Override temperatures and settings based on material
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
        // Keep default values if unknown material
        break;
    }
  }

  // 5. Material Color - Set color based on selection
  if (user.materialColor) {
    overrides.push({ scope: undefined, key: "material_colour", value: user.materialColor });
  }

  // Add some quality settings for better results
  overrides.push({ scope: undefined, key: "retraction_enable", value: true });
  overrides.push({ scope: undefined, key: "wall_line_count", value: 3 });
  overrides.push({ scope: undefined, key: "top_layers", value: 4 });
  overrides.push({ scope: undefined, key: "bottom_layers", value: 3 });
  overrides.push({ scope: undefined, key: "adhesion_type", value: "skirt" });

  return overrides;
}

const STLSlicer = () => {
  const [file, setFile] = useState(null);
  const [printInfo, setPrintInfo] = useState(null);
  const [error, setError] = useState("");
  const [isSlicing, setIsSlicing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simplified user settings focusing on the 6 main parameters
  const [userSettings, setUserSettings] = useState({
    layerHeight: 0.15, // Normal (default)
    infillDensity: 20, // 20% default
    infillPattern: "grid", // Grid default
    supportEnable: false, // No support by default
    materialType: "pla", // PLA default
    materialColor: "blue", // Blue for PLA default
  });

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

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith(".stl")) {
      setFile(selectedFile);
      setPrintInfo(null);
      setError("");
    } else {
      setError("Please select a valid STL file");
    }
  };

  const handleSettingChange = (key, value) => {
    let newSettings = { ...userSettings, [key]: value };
    
    // Auto-set material color based on material type
    if (key === 'materialType') {
      const selectedMaterial = materialOptions.find(m => m.value === value);
      if (selectedMaterial) {
        newSettings.materialColor = selectedMaterial.color;
      }
    }
    
    setUserSettings(newSettings);
  };

  const sliceFile = async () => {
    if (!file) {
      setError("Please select an STL file first");
      return;
    }

    setIsSlicing(true);
    setProgress(0);
    setError("");

    try {
      console.log("Building overrides with settings:", userSettings);
      const overrides = buildOverrides(userSettings);
      console.log("Generated overrides:", overrides);
      
      // Double check infill setting
      const infillOverride = overrides.find(o => o.key === "infill_sparse_density");
      console.log("Infill override found:", infillOverride);

      const slicer = new CuraWASM({
        definition: resolveDefinition("ultimaker2"),
        overrides: overrides,
        verbose: true,
      });

      // Progress tracking
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
        // Calculate filament usage more accurately
        const filamentMm = result.metadata.filamentUsage || 
                          result.metadata.material1Usage || 
                          result.metadata.filament_used || 0;

        // Get material density based on type
        let materialDensity = 1.24; // PLA default
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

        const info = {
          estimatedTime: result.metadata.printTime || 
                        result.metadata.print_time || 
                        result.metadata.estimated_time || "N/A",
          filamentUsedMm: filamentMm,
          filamentUsedGrams: filamentGrams.toFixed(2),
          volume: result.metadata.volume || "N/A",
          height: result.metadata.height || "N/A", 
          width: result.metadata.width || "N/A",
          depth: result.metadata.depth || "N/A",
          layerCount: result.metadata.layers || result.metadata.layer_count || "N/A",
          materialType: userSettings.materialType.toUpperCase(),
          materialColor: userSettings.materialColor,
          layerHeight: userSettings.layerHeight,
          infillDensity: userSettings.infillDensity,
        };
        
        console.log("Processed print info:", info);
        setPrintInfo(info);
      } else {
        console.warn("No metadata received from slicing operation");
        setPrintInfo({
          estimatedTime: "N/A",
          filamentUsedMm: "N/A", 
          filamentUsedGrams: "N/A",
          volume: "N/A",
          height: "N/A",
          width: "N/A",
          depth: "N/A",
          layerCount: "N/A",
          materialType: userSettings.materialType.toUpperCase(),
          materialColor: userSettings.materialColor,
          layerHeight: userSettings.layerHeight,
          infillDensity: userSettings.infillDensity,
        });
      }

      // Clean up
      slicer.dispose();

    } catch (err) {
      console.error("Slicing error:", err);
      setError(`Slicing failed: ${err.message}`);
    } finally {
      setIsSlicing(false);
      setProgress(0);
    }
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

  const getQualityDescription = (layerHeight) => {
    const option = layerHeightOptions.find(opt => opt.value === layerHeight);
    return option ? option.label : `${layerHeight}mm`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">STL to G-Code Slicer</h2>

      {/* File Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select STL File
        </label>
        <input 
          type="file" 
          accept=".stl" 
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Settings Panel */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Print Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Layer Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layer Height
            </label>
            <select
              value={userSettings.layerHeight}
              onChange={(e) => handleSettingChange('layerHeight', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {layerHeightOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Infill Density */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Infill Density ({userSettings.infillDensity}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={userSettings.infillDensity}
              onChange={(e) => handleSettingChange('infillDensity', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* 3. Infill Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Infill Type
            </label>
            <select
              value={userSettings.infillPattern}
              onChange={(e) => handleSettingChange('infillPattern', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="grid">Grid</option>
              <option value="lines">Lines</option>
              <option value="triangles">Triangles</option>
              <option value="cubic">Cubic</option>
              <option value="concentric">Concentric</option>
              <option value="zigzag">Zigzag</option>
              <option value="gyroid">Gyroid</option>
            </select>
          </div>

          {/* 4. Support Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Support Required
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="support"
                  checked={!userSettings.supportEnable}
                  onChange={() => handleSettingChange('supportEnable', false)}
                  className="mr-2"
                />
                No
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="support"
                  checked={userSettings.supportEnable}
                  onChange={() => handleSettingChange('supportEnable', true)}
                  className="mr-2"
                />
                Yes
              </label>
            </div>
          </div>

          {/* 5. Material Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Type
            </label>
            <select
              value={userSettings.materialType}
              onChange={(e) => handleSettingChange('materialType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {materialOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Material Color (Display Only - Auto-set) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Color
            </label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: userSettings.materialColor }}
              ></div>
              <span className="capitalize text-sm font-medium">
                {userSettings.materialColor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Settings Summary */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">Current Settings Summary:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <span><strong>Quality:</strong> {getQualityDescription(userSettings.layerHeight)}</span>
          <span><strong>Infill:</strong> {userSettings.infillDensity}% {userSettings.infillPattern}</span>
          <span><strong>Support:</strong> {userSettings.supportEnable ? 'Enabled' : 'Disabled'}</span>
          <span><strong>Material:</strong> {userSettings.materialType.toUpperCase()}</span>
          <span><strong>Color:</strong> {userSettings.materialColor}</span>
        </div>
      </div>

      {/* Slice Button */}
      <div className="mb-6">
        <button 
          onClick={sliceFile}
          disabled={!file || isSlicing}
          className={`w-full py-3 px-6 rounded-md font-medium ${
            !file || isSlicing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {isSlicing ? `Slicing... ${progress}%` : 'Slice STL to G-Code'}
        </button>
      </div>

      {/* Progress Bar */}
      {isSlicing && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">Processing... {progress}%</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <strong>Error:</strong> {error}
        </div>
        )}

      {/* Print Information */}
      {printInfo && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold text-green-800 mb-4">Print Analysis Complete!</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Print Details</h4>
              <p><span className="font-medium">Estimated Time:</span> {formatTime(printInfo.estimatedTime)}</p>
              <p><span className="font-medium">Filament Used:</span> {(printInfo.filamentUsedMm / 1000).toFixed(2)} m</p>
              <p><span className="font-medium">Filament Weight:</span> {printInfo.filamentUsedGrams} g</p>
              <p><span className="font-medium">Total Layers:</span> {printInfo.layerCount}</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Model Dimensions</h4>
              <p><span className="font-medium">Height:</span> {printInfo.height} mm</p>
              <p><span className="font-medium">Width:</span> {printInfo.width} mm</p>
              <p><span className="font-medium">Depth:</span> {printInfo.depth} mm</p>
              <p><span className="font-medium">Volume:</span> {printInfo.volume} mm³</p>
            </div>
          </div>
          
          {/* Settings Used */}
          <div className="mt-4 pt-4 border-t border-green-200">
            <h4 className="font-semibold text-gray-700 mb-2">Settings Used:</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-white px-2 py-1 rounded border">
                <strong>Material:</strong> {printInfo.materialType} ({printInfo.materialColor})
              </span>
              <span className="bg-white px-2 py-1 rounded border">
                <strong>Layer:</strong> {printInfo.layerHeight}mm
              </span>
              <span className="bg-white px-2 py-1 rounded border">
                <strong>Infill:</strong> {printInfo.infillDensity}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default STLSlicer;