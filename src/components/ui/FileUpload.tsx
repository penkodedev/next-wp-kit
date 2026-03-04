import { useState, DragEvent, ChangeEvent } from "react";

interface FileUploadProps {
  maxSizeMB?: number;
}

export default function FileUpload({ maxSizeMB = 5 }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;

    setFile(selectedFile);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0] || null;
    if (!droppedFile) return;

    setFile(droppedFile);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  const isValid = file ? file.size <= maxSizeBytes : true;

  return (
    <div
      className={`file-upload ${isDragging ? "dragging" : ""} ${
        !isValid ? "error" : ""
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <label className="upload-label">
        {file ? "Cambiar archivo" : "Arrastra un archivo o haz click"}
        <input type="file" onChange={handleFileChange} hidden />
      </label>

      {file && (
        <div className="file-info">
          {file.type.startsWith("image/") && (
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="preview"
            />
          )}
          <div>
            <strong>{file.name}</strong>
            <span> — {formatBytes(file.size)}</span>
          </div>
          {!isValid && (
            <p className="error-message">
              Archivo demasiado grande (máx {maxSizeMB} MB)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
