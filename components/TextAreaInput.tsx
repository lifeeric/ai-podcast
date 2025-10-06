
import React from 'react';

interface TextAreaInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ value, onChange }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder="Paste the full text of your blog post here..."
      className="w-full h-64 p-4 bg-slate-900 border border-slate-600 rounded-lg text-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 resize-y"
    />
  );
};

export default TextAreaInput;
