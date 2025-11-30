import React, { useState, useRef } from 'react';
import { ConverterToolId } from '../types';

declare global {
  interface Window {
    jspdf: any;
    pdfjsLib: any;
    mammoth: any;
    html2canvas: any;
    html2pdf: any;
    PptxGenJS: any;
    JSZip: any;
  }
}

interface ConverterProps {
  toolId: ConverterToolId;
}

const Converter: React.FC<ConverterProps> = ({ toolId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToolInfo = (id: ConverterToolId) => {
    switch(id) {
      case 'pdf-to-word': return { title: 'PDF to Word', desc: 'Convert your PDF to editable Word documents.', accept: '.pdf', color: 'bg-blue-600', icon: 'description' };
      case 'word-to-pdf': return { title: 'Word to PDF', desc: 'Convert DOC/DOCX files to PDF.', accept: '.docx', color: 'bg-red-600', icon: 'picture_as_pdf' };
      
      case 'ppt-to-pdf': return { title: 'PPT to PDF', desc: 'Extract content from PowerPoint to PDF.', accept: '.pptx', color: 'bg-red-600', icon: 'slideshow' };
      case 'pdf-to-ppt': return { title: 'PDF to PPT', desc: 'Convert PDF slides to PowerPoint presentation.', accept: '.pdf', color: 'bg-orange-600', icon: 'co_present' };

      case 'jpg-to-pdf': return { title: 'JPG to PDF', desc: 'Convert images to PDF.', accept: '.jpg,.jpeg,.png', color: 'bg-red-600', icon: 'picture_as_pdf' };
      case 'pdf-to-jpg': return { title: 'PDF to JPG', desc: 'Save PDF pages as images.', accept: '.pdf', color: 'bg-emerald-600', icon: 'collections' };
      default: return { title: 'Converter', desc: '', accept: '*', color: 'bg-slate-600', icon: 'settings' };
    }
  };

  const info = getToolInfo(toolId);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setStatus('idle');
      setDownloadUrl(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setDownloadUrl(null);
    }
  };

  const convertFile = async () => {
    if (!file) return;
    setStatus('processing');

    try {
      // --- JPG TO PDF ---
      if (toolId === 'jpg-to-pdf') {
        if (!window.jspdf) throw new Error("PDF Library not loaded");
        const { jsPDF } = window.jspdf;
        
        const doc = new jsPDF();
        const url = URL.createObjectURL(file);
        
        const img = new Image();
        img.src = url;
        await new Promise(r => img.onload = r);

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
        const imgWidth = img.width * ratio;
        const imgHeight = img.height * ratio;

        doc.addImage(img, 'JPEG', 0, 0, imgWidth, imgHeight);
        const blob = doc.output('blob');
        setDownloadUrl(URL.createObjectURL(blob));
      }

      // --- PDF TO JPG ---
      else if (toolId === 'pdf-to-jpg') {
        if (!window.pdfjsLib) throw new Error("PDF Reader Lib not loaded");
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1); // Convert 1st page
        
        const scale = 2; // High resolution
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        
        canvas.toBlob((blob) => {
           if (blob) {
               setDownloadUrl(URL.createObjectURL(blob));
               setStatus('done');
           } else {
               throw new Error("Canvas to Blob failed");
           }
        }, 'image/jpeg', 0.95);
        return; // async flow
      }

      // --- PDF TO WORD ---
      else if (toolId === 'pdf-to-word') {
        if (!window.pdfjsLib) throw new Error("PDF Reader Lib not loaded");

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
        
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
           const page = await pdf.getPage(i);
           const textContent = await page.getTextContent();
           const pageText = textContent.items.map((item: any) => item.str).join(' ');
           fullText += `\n\n--- Page ${i} ---\n\n` + pageText;
        }

        const htmlContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
          <body>
            <h1>Extracted Text from PDF</h1>
            <p style="white-space: pre-wrap;">${fullText}</p>
          </body></html>
        `;
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        setDownloadUrl(URL.createObjectURL(blob));
      }

      // --- WORD TO PDF ---
      else if (toolId === 'word-to-pdf') {
         if (!window.mammoth) throw new Error("Mammoth Lib not loaded");
         
         const arrayBuffer = await file.arrayBuffer();
         const result = await window.mammoth.convertToHtml({ arrayBuffer });
         const html = `
            <div style="font-family: Arial; padding: 20px; color: black; background: white;">
               ${result.value}
            </div>
         `;
         
         const opt = {
            margin: 10,
            filename: file.name.replace('.docx', '.pdf'),
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
         };
         
         const pdfBlob = await window.html2pdf().from(html).output('blob');
         setDownloadUrl(URL.createObjectURL(pdfBlob));
      }

      // --- PDF TO PPT ---
      else if (toolId === 'pdf-to-ppt') {
         if (!window.pdfjsLib || !window.PptxGenJS) throw new Error("Libraries not loaded");
         
         const arrayBuffer = await file.arrayBuffer();
         const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
         const pptx = new window.PptxGenJS();
         
         // Loop through all pages
         for (let i = 1; i <= pdf.numPages; i++) {
             const page = await pdf.getPage(i);
             const viewport = page.getViewport({ scale: 2 });
             
             const canvas = document.createElement('canvas');
             const context = canvas.getContext('2d');
             canvas.height = viewport.height;
             canvas.width = viewport.width;
             
             await page.render({ canvasContext: context, viewport: viewport }).promise;
             
             // Convert page to image
             const imgData = canvas.toDataURL('image/jpeg', 0.8);
             
             // Add slide
             const slide = pptx.addSlide();
             slide.background = { data: imgData };
         }
         
         // Generate File
         const blob = await pptx.write("blob");
         setDownloadUrl(URL.createObjectURL(blob));
      }

      // --- PPT TO PDF ---
      else if (toolId === 'ppt-to-pdf') {
         // This is a "Best Effort" conversion (Content Extraction) 
         // because full PPTX rendering in browser is very heavy/unreliable.
         if (!window.JSZip || !window.html2pdf) throw new Error("Libraries not loaded");
         
         const zip = new window.JSZip();
         const loadedZip = await zip.loadAsync(file);
         
         let fullTextContent = `<h1>${file.name} (Converted Content)</h1><hr/>`;
         
         // Try to find slides in the zip structure
         // Usually located in ppt/slides/slide1.xml, slide2.xml ...
         let slideIndex = 1;
         while(true) {
            const fileName = `ppt/slides/slide${slideIndex}.xml`;
            const slideFile = loadedZip.file(fileName);
            if (!slideFile) break;
            
            const xmlText = await slideFile.async("string");
            
            // Very basic XML text extraction using Regex to find <a:t> tags
            const textMatches = xmlText.match(/<a:t>([^<]*)<\/a:t>/g);
            
            fullTextContent += `<div style="margin-bottom: 20px; border:1px solid #ccc; padding:10px;"><h3>Slide ${slideIndex}</h3>`;
            if (textMatches) {
               const cleanText = textMatches.map((t: string) => t.replace(/<\/?a:t>/g, '')).join(' ');
               fullTextContent += `<p>${cleanText}</p>`;
            } else {
               fullTextContent += `<p><i>(No text content found)</i></p>`;
            }
            fullTextContent += `</div>`;
            
            slideIndex++;
         }
         
         if (slideIndex === 1) {
            fullTextContent += "<p>Could not extract text from this PowerPoint file. It might be image-based or protected.</p>";
         }
         
         // Convert the extracted HTML representation to PDF
         const pdfBlob = await window.html2pdf().from(fullTextContent).output('blob');
         setDownloadUrl(URL.createObjectURL(pdfBlob));
      }

      setStatus('done');
    } catch (e: any) {
      console.error(e);
      alert(`Conversion failed: ${e.message || 'Unknown Error'}.`);
      setStatus('idle');
    }
  };

  const getDownloadName = () => {
    if (!file) return 'converted_file';
    const name = file.name.split('.')[0];
    if (toolId.includes('to-pdf')) return `${name}.pdf`;
    if (toolId.includes('to-word')) return `${name}.doc`;
    if (toolId.includes('to-jpg')) return `${name}.jpg`;
    if (toolId.includes('to-ppt')) return `${name}.pptx`;
    return `${name}_converted`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
      
      <div className="max-w-4xl w-full text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">{info.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">{info.desc}</p>
      </div>

      {status === 'processing' ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-lg border border-slate-200 dark:border-slate-700">
          <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-600 border-t-rose-500 rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Converting...</h2>
          <p className="text-slate-500">Processing file: {file?.name}</p>
        </div>
      ) : status === 'done' && downloadUrl ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-lg border border-slate-200 dark:border-slate-700 animate-scale-up">
           <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
             <span className="material-icons-round text-5xl">check</span>
           </div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Conversion Completed!</h2>
           <a 
             href={downloadUrl} 
             download={getDownloadName()}
             className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-xl flex items-center gap-2"
           >
             Download File <span className="material-icons-round">download</span>
           </a>
           <button onClick={() => { setStatus('idle'); setFile(null); setDownloadUrl(null); }} className="mt-6 text-slate-500 hover:text-slate-800 dark:hover:text-white underline decoration-slate-300 underline-offset-4">Convert another file</button>
        </div>
      ) : (
        <div 
          className={`
            w-full max-w-3xl h-80 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group
            ${isDragging ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/10 scale-105' : 'border-slate-300 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
           <input type="file" ref={fileInputRef} className="hidden" accept={info.accept} onChange={handleFileSelect} />
           
           {!file ? (
             <>
               <span className={`material-icons-round text-8xl mb-6 transition-colors duration-300 ${isDragging ? 'text-rose-500' : 'text-slate-300 dark:text-slate-600 group-hover:text-rose-400'}`}>{info.icon}</span>
               <button className={`px-10 py-4 ${info.color} text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all mb-4 z-10 relative`}>
                 Select {info.accept === '.pptx' ? 'PowerPoint' : info.accept === '.pdf' ? 'PDF' : 'File'}
               </button>
               <p className="text-slate-500 dark:text-slate-400 font-medium">or drop files here</p>
             </>
           ) : (
             <div className="flex flex-col items-center z-10 animate-fade-in">
                <span className="material-icons-round text-6xl text-rose-500 mb-4">description</span>
                <p className="text-xl font-bold text-slate-800 dark:text-white mb-6">{file.name}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); convertFile(); }}
                  className="px-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xl shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  Convert to {toolId.split('-').pop()?.toUpperCase()} <span className="material-icons-round">arrow_forward</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }} 
                  className="mt-4 text-slate-400 hover:text-red-500 transition-colors"
                >
                  Remove file
                </button>
             </div>
           )}
           
           {/* Decorative Background Icon */}
           <span className="material-icons-round absolute -bottom-10 -right-10 text-[200px] text-slate-100 dark:text-white/5 pointer-events-none transition-transform duration-500 group-hover:rotate-12">{info.icon}</span>
        </div>
      )}

    </div>
  );
};

export default Converter;