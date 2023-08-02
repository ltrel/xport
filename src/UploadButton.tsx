import { Button } from "@mui/material";
import { ChangeEvent, ReactNode, useRef } from "react";

interface UploadButtonProps {
  onUpload: (f: File) => void;
  children?: ReactNode;
}

export default function UploadButton({ onUpload, children }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleChangeEvent = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        ref={inputRef}
        onChange={handleChangeEvent}
        style={{ display: 'none' }}

      />
      <Button onClick={handleUploadClick}>{children}</Button>
    </>
  )
}
