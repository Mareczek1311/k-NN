import React, { useRef } from "react";
import "../App.css"

interface InputFileProps {
  label: string;
  handleSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputFile: React.FC<InputFileProps> = ({ label, handleSelectFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current!.click();
  };

  return (
    <>
      <label>{label}</label>
      <button className="start-screen-button" onClick={handleButtonClick}>Wybierz wlasne</button>
      <input style={{ display: 'none' }} ref={fileInputRef} type="file" onChange={handleSelectFile} />
    </>
  );
};

export default InputFile;