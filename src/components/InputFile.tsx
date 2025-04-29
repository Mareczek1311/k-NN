import React from "react";

interface InputFileProps {
  label: string;
  handleSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputFile: React.FC<InputFileProps> = ({ label, handleSelectFile }) => {
  return (
    <>
      <label>{label}</label>
      <input type="file" onChange={handleSelectFile} />
    </>
  );
};

export default InputFile;