import React from "react";

interface InputNumberProps {
  label: string;
  handleSelectNumber: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputNumber: React.FC<InputNumberProps> = ({ label, handleSelectNumber }) => {
  return (
    <>
      <label>{label}</label>
      <input type="number"
        min={3}
        max={20}
        defaultValue={5}
        onChange={handleSelectNumber} />
    </>
  );
};

export default InputNumber;