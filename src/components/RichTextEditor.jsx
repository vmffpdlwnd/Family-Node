import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
];

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'blockquote',
  'code-block',
  'link',
  'image',
];

const RichTextEditor = ({ value, onChange }) => {
  const editorRootRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (!editorRootRef.current || quillRef.current) return;

    quillRef.current = new Quill(editorRootRef.current, {
      theme: 'snow',
      modules: {
        toolbar: toolbarOptions,
      },
      formats,
      placeholder: '내용을 입력하세요',
    });

    quillRef.current.on('text-change', () => {
      if (onChange) {
        onChange(quillRef.current.root.innerHTML);
      }
    });

    if (value) {
      quillRef.current.root.innerHTML = value;
    }
  }, [onChange, value]);

  useEffect(() => {
    if (!quillRef.current) return;
    const currentHtml = quillRef.current.root.innerHTML;
    if (value !== currentHtml) {
      quillRef.current.root.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div style={{ minHeight: 260 }}>
      <div ref={editorRootRef} />
    </div>
  );
};

export default RichTextEditor;
