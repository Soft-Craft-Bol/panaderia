import { resizeImage } from './resizeImage';

export const handleFileChange = async (event, setSelectedFile, setPreviewUrl) => {
    const file = event.target.files[0];
    if (file) {
        try {
            const resizedFile = await resizeImage(file);
            setSelectedFile(resizedFile);

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target.result);
            };
            reader.readAsDataURL(resizedFile);
        } catch (error) {
            console.error('Error resizing the image:', error);
        }
    }
};