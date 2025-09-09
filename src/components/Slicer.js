import React, { useState } from "react";
import { CuraWASM } from "cura-wasm";
import { resolveDefinition } from "cura-wasm-definitions";

// 🔧 Helper to build overrides
function buildOverrides(user) {
  const overrides = [
    { key: "speed_print", value: 80 },
    { key: "retraction_enable", value: true },
    { key: "wall_line_count", value: 2 },
    { key: "top_layers", value: 3 },
    { key: "bottom_layers", value: 3 },
    { key: "infill_overlap", value: 15 },
    { key: "initial_layer_height", value: 0.2 },
    { key: "adhesion_type", value: "skirt" },
  ];

  if (user.layerHeight) overrides.push({ key: "layer_height", value: user.layerHeight });
  if (user.infillDensity !== undefined) overrides.push({ key: "infill_sparse_density", value: user.infillDensity });
  if (user.infillPattern) overrides.push({ key: "infill_pattern", value: user.infillPattern });
  if (user.supportEnable !== undefined) overrides.push({ key: "support_enable", value: user.supportEnable });
  if (user.supportType) overrides.push({ key: "support_type", value: user.supportType });

  if (user.materialType) {
    switch (user.materialType.toLowerCase()) {
      case "pla":
        overrides.push({ key: "material_print_temperature", value: 210 });
        overrides.push({ key: "material_bed_temperature", value: 70 });
        break;
      case "abs":
        overrides.push({ key: "material_print_temperature", value: 240 });
        overrides.push({ key: "material_bed_temperature", value: 100 });
        break;
      case "petg":
        overrides.push({ key: "material_print_temperature", value: 235 });
        overrides.push({ key: "material_bed_temperature", value: 80 });
        break;
      case "tpu":
        overrides.push({ key: "material_print_temperature", value: 220 });
        overrides.push({ key: "material_bed_temperature", value: 60 });
        break;
      default:
        overrides.push({ key: "material_print_temperature", value: 210 });
        overrides.push({ key: "material_bed_temperature", value: 70 });
    }
  }

  if (user.materialColor) overrides.push({ key: "material_colour", value: user.materialColor });

  return overrides;
}

const STLSlicer = () => {
  const [file, setFile] = useState(null);
  const [printInfo, setPrintInfo] = useState(null);
  const [error, setError] = useState("");

  // Example user settings (later can be dynamic form inputs)
  const userSettings = {
    layerHeight: 0.16,
    infillDensity: 80,
    infillPattern: "grid",
    supportEnable: false,
    supportType: "buildplate",
    materialType: "pla",
    materialColor: "blue",
  };

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

  const sliceFile = async () => {
    if (!file) {
      setError("Please select an STL file first");
      return;
    }

    try {
      const slicer = new CuraWASM({
        definition: resolveDefinition("ultimaker2"),
        overrides: buildOverrides(userSettings),
      });

      const arrayBuffer = await file.arrayBuffer();
      const result = await slicer.slice(arrayBuffer, "stl");

      console.log("Generated G-code:", result.gcode);

      if (result.metadata) {
        const filamentMm =
          result.metadata.filamentUsage ||
          result.metadata.material1Usage ||
          0;

        const filamentGrams =
          userSettings.materialType?.toLowerCase() === "pla"
            ? (filamentMm / 1000) * 1.24 // PLA density ~1.24 g/cm³
            : (filamentMm / 1000) * 1.05; // fallback density

        const info = {
          estimatedTime: result.metadata.printTime || result.metadata.print_time || "N/A",
          filamentUsedMm: filamentMm,
          filamentUsedGrams: filamentGrams.toFixed(2),
          volume: result.metadata.volume || "N/A",
          height: result.metadata.height || "N/A",
          width: result.metadata.width || "N/A",
          depth: result.metadata.depth || "N/A",
        };
        setPrintInfo(info);
      } else {
        setPrintInfo({
          estimatedTime: "N/A",
          filamentUsedMm: "N/A",
          filamentUsedGrams: "N/A",
          volume: "N/A",
          height: "N/A",
          width: "N/A",
          depth: "N/A",
        });
      }
    } catch (err) {
      console.error("Slicing error:", err);
      setError(`Slicing failed: ${err.message}`);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds === "N/A") return "N/A";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div>
      <h2>Slice STL to G-code</h2>

      <input type="file" accept=".stl" onChange={handleFileSelect} />
      <button onClick={sliceFile}>Slice STL</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {printInfo && (
        <div>
          <h3>Print Information</h3>
          <p>Print Time: {formatTime(printInfo.estimatedTime)}</p>
          <p>Filament Used: {(printInfo.filamentUsedMm / 1000).toFixed(2)} m</p>
          <p>Filament Weight: {printInfo.filamentUsedGrams} g</p>
          <p>Volume: {printInfo.volume}</p>
          <p>Height: {printInfo.height}</p>
          <p>Width: {printInfo.width}</p>
          <p>Depth: {printInfo.depth}</p>
        </div>
      )}
    </div>
  );
};

export default STLSlicer;
