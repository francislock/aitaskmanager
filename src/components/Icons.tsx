import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
}

export const MicrophoneIcon: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 11C19 14.866 15.866 18 12 18C8.13401 18 5 14.866 5 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 18V22M12 22H8M12 22H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const SendIcon: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="sendGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2196F3" />
                <stop offset="100%" stopColor="#9C27B0" />
            </linearGradient>
        </defs>
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="url(#sendGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2196F3" />
                <stop offset="100%" stopColor="#9C27B0" />
            </linearGradient>
        </defs>
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="url(#calendarGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2V6M8 2V6M3 10H21" stroke="url(#calendarGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const EditIcon: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="editGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2196F3" />
                <stop offset="100%" stopColor="#9C27B0" />
            </linearGradient>
        </defs>
        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="url(#editGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="url(#editGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const DeleteIcon: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="deleteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2196F3" />
                <stop offset="100%" stopColor="#9C27B0" />
            </linearGradient>
        </defs>
        <path d="M3 6H5H21" stroke="url(#deleteGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="url(#deleteGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
