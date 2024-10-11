import React from 'react';
import { Dialog, DialogOverlay, DialogContent, DialogClose } from './ui/dialog';

const ResourceModal = ({ isOpen, onClose, resourceUrl, dataType }: { isOpen: boolean, onClose: () => void, resourceUrl: string, dataType: string }) => {
    const renderContent = () => {
        switch (dataType) {
            case 'webp':
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <img src={`https://tomato-characteristic-quail-246.mypinata.cloud/ipfs/${resourceUrl}`} alt="Resource" className="w-full h-full object-cover" />;
            case 'mp4':
            case 'webm':
                return <video src={`https://tomato-characteristic-quail-246.mypinata.cloud/ipfs/${resourceUrl}`} controls className="w-full h-full object-cover" />;
            case 'pdf':
            case 'doc':
            case 'docx':
                return <iframe src={`${`https://tomato-characteristic-quail-246.mypinata.cloud/ipfs/${resourceUrl}`}#zoom=40`} className="w-full h-[90vh] object-cover" />;
            default:
                return <div className="h-full w-full flex items-center justify-center bg-gray-200">Unsupported file type</div>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay />
            <DialogContent className="p-0">
                {renderContent()}
                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none !bg-white">
                    <span className="sr-only">Close</span>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};

export default ResourceModal;