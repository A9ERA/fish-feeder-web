import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { useNavigate } from 'react-router-dom';
import { database } from '../config/firebase';
import { ref, get } from 'firebase/database';
import { MdLock, MdBackspace } from 'react-icons/md';

interface PinModalProps {
    isOpen: boolean;
    onPinVerified: () => void;
    pageName: string;
}

const PinModal = ({ isOpen, onPinVerified, pageName }: PinModalProps) => {
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    // Reset states when modal opens
    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError('');
            setIsVerifying(false);
        }
    }, [isOpen]);

    // Auto-verify when PIN reaches 4 digits
    useEffect(() => {
        if (pin.length === 4) {
            verifyPin();
        }
    }, [pin]);

    const verifyPin = async () => {
        setIsVerifying(true);
        setError('');

        try {
            const pinRef = ref(database, 'app_setting/pin');
            const snapshot = await get(pinRef);
            const correctPin = snapshot.val();

            if (correctPin && pin === correctPin.toString()) {
                onPinVerified();
            } else {
                setError('รหัส PIN ไม่ถูกต้อง');
                setPin('');
            }
        } catch (error) {
            console.error('Error verifying PIN:', error);
            setError('เกิดข้อผิดพลาดในการตรวจสอบ PIN');
            setPin('');
        }

        setIsVerifying(false);
    };

    const handleNumberClick = (number: string) => {
        if (pin.length < 4 && !isVerifying) {
            setPin(prev => prev + number);
            setError('');
        }
    };

    const handleBackspace = () => {
        if (!isVerifying) {
            setPin(prev => prev.slice(0, -1));
            setError('');
        }
    };

    // Handle modal close - navigate to splash screen
    const handleClose = () => {
        navigate('/');
    };

    // Number pad layout - 3x3 grid for 1-9, then 0 and backspace on bottom row
    const numberRows = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9']
    ];

    return (
        <Modal
            isOpen={isOpen}
            isDismissable={true}
            hideCloseButton={true}
            placement="center"
            backdrop="blur"
            onClose={handleClose}
        >
            <ModalContent className="max-w-sm">
                <ModalHeader className="flex flex-col gap-1 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <MdLock className="text-primary text-xl" />
                        <span>ป้อนรหัส PIN</span>
                    </div>
                    <p className="text-sm text-default-500 font-normal">
                        เพื่อเข้าใช้งาน {pageName}
                    </p>
                </ModalHeader>
                <ModalBody className="pb-6">
                    {/* PIN Display */}
                    <div className="flex justify-center gap-3 mb-6">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold ${pin.length > index
                                        ? 'border-primary bg-primary/20 text-primary'
                                        : 'border-default-300 bg-default-100 text-default-400'
                                    }`}
                            >
                                {pin.length > index ? '●' : ''}
                            </div>
                        ))}
                    </div>

                    {/* Loading Spinner */}
                    {isVerifying && (
                        <div className="flex justify-center mb-4">
                            <Spinner size="sm" color="primary" />
                            <span className="ml-2 text-sm text-default-500">กำลังตรวจสอบ...</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="text-center mb-4">
                            <p className="text-danger text-sm">{error}</p>
                        </div>
                    )}

                    {/* Number Pad */}
                    <div className="space-y-3">
                        {/* Rows 1-3: Numbers 1-9 */}
                        {numberRows.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center gap-3">
                                {row.map((number) => (
                                    <Button
                                        key={number}
                                        variant="flat"
                                        className="w-16 h-16 text-xl font-semibold"
                                        onPress={() => handleNumberClick(number)}
                                        isDisabled={isVerifying}
                                    >
                                        {number}
                                    </Button>
                                ))}
                            </div>
                        ))}

                        {/* Bottom row: 0 and Backspace */}
                        <div className="flex justify-center gap-3 mt-4">
                            {/* Empty space to align with column 1 (under 7) */}
                            <div className="w-[80px] h-16"></div>

                            {/* 0 button aligned with column 2 (under 8) */}
                            <Button
                                variant="flat"
                                className="w-16 h-16 text-xl font-semibold"
                                onPress={() => handleNumberClick('0')}
                                isDisabled={isVerifying}
                            >
                                0
                            </Button>

                            {/* Backspace button aligned with column 3 (under 9) */}
                            <Button
                                variant="flat"
                                className="w-16 h-16"
                                onPress={handleBackspace}
                                isDisabled={isVerifying}
                            >
                                <MdBackspace className="text-xl" />
                            </Button>
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default PinModal; 