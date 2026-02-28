import { PRICE_PERCENTAGE } from "@/constants/Constants";
import { getContractById } from "./event.service";
import { getPayerById, getReceiverById } from "./product.service";

const monthName = (n: number) => {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return names[n];
};

const getMonthYearKey = (date: string | number | Date) => {
    const d = new Date(date);
    return `${monthName(d.getMonth())} ${d.getFullYear()}`;
};

const getWeekRangeKey = (date: string | number | Date) => {
    const d = new Date(date);
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - d.getDay());
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    return `${sunday.toISOString().split('T')[0]} to ${saturday.toISOString().split('T')[0]}`;
};

const getUserPaymentData = async (userId: string) => {
    const buyer = await getPayerById(userId);
    const seller = await getReceiverById(userId);
    const now = new Date();
    const currentSunday = new Date(now);
    currentSunday.setDate(now.getDate() - now.getDay());
    currentSunday.setHours(0, 0, 0, 0);

    const monthly: Record<string, { products: any[]; services: any[] }> = {};
    const weeklyReceivables: Record<string, any[]> = {};
    const weeklyExpendings: Record<string, any[]> = {};
    const currentWeekReceivables: any[] = [];
    const payments: any[] = [];

    for (const item of buyer) {
        item.earnings = false;
        payments.push(item);
    }
    for (const item of seller) {
        item.earnings = true;
        item.price *= PRICE_PERCENTAGE;
        payments.push(item);
    }

    for (const payment of payments) {
        const paidAtDate = new Date(payment.paidAt);

        const monthKey = getMonthYearKey(paidAtDate);
        if (!monthly[monthKey]) {
            monthly[monthKey] = { products: [], services: [] };
        }
        if (payment.products?.length > 0) {
            monthly[monthKey].products.push(payment);
        } else if (payment.contract) {
            const contract = await getContractById(payment.contract);
            if (contract) {
                payment.contract = contract;
                monthly[monthKey].services.push({ ...payment, contract });
            }
        }

        const weekKey = getWeekRangeKey(paidAtDate);
        if (payment.earnings) {
            if (!weeklyReceivables[weekKey]) weeklyReceivables[weekKey] = [];
            weeklyReceivables[weekKey].push(payment);

            if (paidAtDate >= currentSunday) {
                currentWeekReceivables.push(payment);
            }
        } else {
            if (!weeklyExpendings[weekKey]) weeklyExpendings[weekKey] = [];
            weeklyExpendings[weekKey].push(payment);
        }
    }

    return {
        monthlyStatements: monthly,
        weeklyReceivables,
        weeklyExpendings,
        currentWeekReceivables,
    };
};

export default getUserPaymentData;