import axios from 'axios';

const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'riee-consultorio');

  try {
    const response = await axios.post(
      'https://api.cloudinary.com/v1_1/dzizafv5s/image/upload',
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error al subir la imagen');
  }
};

export default uploadImageToCloudinary;
