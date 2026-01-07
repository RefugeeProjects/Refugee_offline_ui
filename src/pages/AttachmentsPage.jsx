import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../utils';

const AttachmentsPage = () => {
const token = localStorage.getItem("token");

  const { id } = useParams(); // ✅ استقبال id من المسار
  // const baseUrl = process.env.REACT_APP_TRAFFIC_API;
  const baseUrl = process.env.REACT_APP_FILES_BASE_URL;

  const [files, setFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 🔹 جلب الملفات الخاصة باللاجئ
  useEffect(() => {
    const fetchFiles = async () => {
      try {
      if (!token) {
  setError("انتهت الجلسة، أعد تسجيل الدخول");
  setLoading(false);
  return;
}

        const response = await fetch(`${baseUrl}/freqs/refugees/${id}/with-files`, { headers: {
      Authorization: `Bearer ${token}`,
    },
        });
        const result = await response.json();

        if (result.success) {
          const cleanFiles = (result.data.files || []);
          setFiles(result.data.files || []);
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
const openFile = async (fileId, fileType) => {

  if (!token) {
    setError("انتهت الجلسة، أعد تسجيل الدخول");
    return;
  }

  const res = await fetch(`${baseUrl}/freqs/files/${fileId}`, {
    headers: { Authorization: `Bearer ${token}` },
  
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  if (fileType?.startsWith("image")) {
    setSelectedImage(url);
  } else {
    window.open(url, "_blank");
  }
};

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
            <button onClick={() => openFile(file.file_id, file.file_type)}>
  عرض
</button>

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
