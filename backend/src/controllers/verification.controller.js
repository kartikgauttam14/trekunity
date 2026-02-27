import { prisma } from '../utils/prisma.js';
import { AppError } from '../utils/AppError.js';

// POST /api/verifications/submit
export const submitVerification = async (req, res) => {
    const { documentType, documentNumber, documentUrl, digiLockerId } = req.body;

    const verification = await prisma.verification.create({
        data: {
            userId: req.user.id,
            documentType,
            documentNumber,
            documentUrl,
            digiLockerId,
            status: digiLockerId ? 'VERIFIED' : 'PENDING', // Auto-verify if DigiLocker ID is provided (mock)
            verifiedAt: digiLockerId ? new Date() : null,
        },
    });

    res.status(201).json({ success: true, data: verification });
};

// GET /api/verifications/status
export const getVerificationStatus = async (req, res) => {
    const verifications = await prisma.verification.findMany({
        where: { userId: req.user.id },
    });

    const isFullyVerified = verifications.some(v => v.documentType === 'DL' && v.status === 'VERIFIED') &&
        verifications.some(v => v.documentType === 'AADHAAR' && v.status === 'VERIFIED');

    res.json({
        success: true,
        data: {
            verifications,
            isFullyVerified
        }
    });
};

// POST /api/verifications/accept-policy
export const acceptPolicy = async (req, res) => {
    const { policyType, version } = req.body;

    const acceptance = await prisma.policyAcceptance.create({
        data: {
            userId: req.user.id,
            policyType,
            policyVersion: version || '1.0',
        },
    });

    res.status(201).json({ success: true, data: acceptance });
};
