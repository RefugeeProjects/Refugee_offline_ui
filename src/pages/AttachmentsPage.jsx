import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../utils';

const AttachmentsPage = () => {
  const { id } = useParams(); // ✅ استقبال id من المسار
  // const baseUrl = process.env.REACT_APP_TRAFFIC_API;
  const baseUrl = process.env.REACT_APP_FILES_BASE_URL;

  const [files, setFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  // 🔹 جلب الملفات الخاصة باللاجئ
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        // const response = await fetch(`${baseUrl}/freqs/refugees/${id}/with-files`);
        // const { success, data } = await api('GET', `freqs/refugees/${id}/with-files`);

        // const result = await data.json();

        // if (result.success) {
        //   const cleanFiles = (result.data.files || []).filter((f) => f && f.file_path);
        //   setFiles(cleanFiles);
        // }
        //  else {
        //   setError('لم يتم العثور على ملفات مرتبطة بهذا اللاجئ');
        // }
        const { success, data } = await api('GET', `freqs/refugees/${id}/with-files`);

        if (success) {
          const cleanFiles = (data.files || []).filter((f) => f && f.file_path);
          setFiles(cleanFiles);
        } else {
          setError('لم يتم العثور على ملفات مرتبطة بهذا اللاجئ');
        }
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('حدث خطأ أثناء تحميل الملفات');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [id, baseUrl]);

  if (loading) return <p className="text-center text-gray-600 mt-10">جاري التحميل...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;
  console.log('full bath', baseUrl);

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
      <h1 className="text-3xl font-bold text-center mb-6">📎 الملفات المرفقة</h1>

      {files.length === 0 ? (
        <p className="text-center text-gray-600">لا توجد ملفات مرفقة بعد</p>
      ) : (
        <ul className="max-w-3xl mx-auto space-y-4">
          {files.map((file) => (
            <div key={file.id}>
              <a href={`${baseUrl.replace('/api', '')}${file.file_path}`} target="_blank" rel="noopener noreferrer">
                {file.file_name}
              </a>
              <img
                src={`${baseUrl.replace('/api', '')}${file.file_path}`}
                alt={file.file_name}
                style={{ width: '150px', margin: '10px', borderRadius: '8px' }}
              />
            </div>
          ))}
        </ul>
      )}

      {/* 🔍 نافذة عرض الصورة */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="preview"
            className="max-w-full max-h-[90vh] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded shadow"
            onClick={() => setSelectedImage(null)}
          >
            إغلاق
          </button>
        </div>
      )}
    </div>
  );
};

export default AttachmentsPage;
