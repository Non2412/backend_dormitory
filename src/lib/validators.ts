// Additional validation helpers for business logic

/**
 * ตรวจสอบว่า startDate ไม่เป็นอดีต
 */
export function validateStartDate(startDate: Date | string): { valid: boolean; error?: string } {
    const date = new Date(startDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day

    if (date < now) {
        return { valid: false, error: 'วันที่เริ่มต้นต้องไม่เป็นอดีต' };
    }

    return { valid: true };
}

/**
 * ตรวจสอบว่า endDate มากกว่า startDate
 */
export function validateDateRange(startDate: Date | string, endDate: Date | string): { valid: boolean; error?: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
        return { valid: false, error: 'วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น' };
    }

    return { valid: true };
}

/**
 * ตรวจสอบว่าราคาเป็นค่าบวกและมีทศนิยมไม่เกิน 2 ตำแหน่ง
 */
export function validatePrice(price: number): { valid: boolean; error?: string } {
    if (price <= 0) {
        return { valid: false, error: 'ราคาต้องมากกว่า 0' };
    }

    // ตรวจสอบทศนิยม
    const decimalPlaces = (price.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
        return { valid: false, error: 'ราคาต้องมีทศนิยมไม่เกิน 2 ตำแหน่ง' };
    }

    return { valid: true };
}

/**
 * ตรวจสอบรูปแบบเบอร์โทรศัพท์ไทย
 */
export function validateThaiPhone(phone: string): { valid: boolean; error?: string } {
    // รูปแบบเบอร์ไทย: 0812345678 หรือ 02-1234567
    const phoneRegex = /^(0[0-9]{1,2}-?[0-9]{7,8})$/;

    if (!phoneRegex.test(phone)) {
        return { valid: false, error: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง' };
    }

    return { valid: true };
}

/**
 * Sanitize string input เพื่อป้องกัน XSS
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * ตรวจสอบว่า pagination parameters ถูกต้อง
 */
export function validatePagination(page: number, limit: number): { valid: boolean; error?: string; sanitized?: { page: number; limit: number } } {
    const maxLimit = 100;
    const minLimit = 1;
    const minPage = 1;

    if (page < minPage) {
        return { valid: false, error: 'หน้าต้องมากกว่าหรือเท่ากับ 1' };
    }

    if (limit < minLimit) {
        return { valid: false, error: 'จำนวนรายการต่อหน้าต้องมากกว่าหรือเท่ากับ 1' };
    }

    if (limit > maxLimit) {
        return {
            valid: true,
            sanitized: { page, limit: maxLimit },
            error: `จำนวนรายการต่อหน้าถูกจำกัดที่ ${maxLimit} รายการ`
        };
    }

    return { valid: true, sanitized: { page, limit } };
}

/**
 * ตรวจสอบว่า ID เป็น CUID ที่ถูกต้อง
 */
export function validateCUID(id: string): { valid: boolean; error?: string } {
    // CUID format: c + timestamp + counter + fingerprint + random
    const cuidRegex = /^c[a-z0-9]{24}$/;

    if (!cuidRegex.test(id)) {
        return { valid: false, error: 'รูปแบบ ID ไม่ถูกต้อง' };
    }

    return { valid: true };
}
