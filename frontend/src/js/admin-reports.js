
// =====================================
// ADMIN REPORTS
// =====================================

const API_URL = 'http://localhost:3001/api';
const PAYMENTS_API_URL = `${API_URL}/payments`;

let reservationChart = null;
let accountChart = null;
let paymentChart = null;
let revenueChart = null;
let reportReservations = [];
let reportTransactions = [];

function authHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}


// =====================================
// LOAD REPORT DATA
// =====================================

async function loadReports() {

    try {

        const response = await fetch(
            `${API_URL}/reservations`
        );

        if (!response.ok) {
            throw new Error(
                'Failed to load reservation data.'
            );
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message ||
                'Failed to load reports.'
            );
        }

        const reservations = data.reservations || [];
        reportReservations = reservations;

        const paymentResponse = await fetch(PAYMENTS_API_URL, {
            headers: authHeaders()
        });
        const paymentData = await paymentResponse.json();

        if (paymentResponse.status === 401) {
            throw new Error('Your login session is missing or expired.');
        }

        if (paymentResponse.status === 403) {
            throw new Error('You are not authorized to view payment transactions.');
        }

        if (!paymentResponse.ok || !paymentData.success) {
            throw new Error(paymentData.message || 'Failed to load payment transactions.');
        }

        reportTransactions = Array.isArray(paymentData.transactions)
            ? paymentData.transactions
            : [];

        console.log(
            'Report reservations:',
            reservations
        );


        // =====================================
        // RESERVATION COUNTS
        // =====================================

        const totalReservations =
            reservations.length;

        const pending =
            reservations.filter(
                r => r.status === 'Pending'
            ).length;

        const approved =
            reservations.filter(
                r => r.status === 'Approved'
            ).length;

        const completed =
            reservations.filter(
                r => r.status === 'Completed'
            ).length;

        const declined =
            reservations.filter(
                r => r.status === 'Declined'
            ).length;


        // =====================================
        // PAYMENT COUNTS
        // =====================================

        const paid =
            reservations.filter(
                r => r.payment_status === 'Paid'
            ).length;

        const unpaid =
            reservations.filter(
                r => r.payment_status === 'Unpaid'
            ).length;


        // =====================================
        // LOAD ACCOUNT DATA
        // =====================================

        let totalClients = 0;
        let totalPersonnel = 0;

        try {

            const accountResponse = await fetch(
                `${API_URL}/auth/accounts`
            );

            if (accountResponse.ok) {

                const accountData =
                    await accountResponse.json();

                const accounts =
                    accountData.accounts || [];

                totalClients =
                    accounts.filter(
                        account =>
                            account.account_type === 'Client'
                    ).length;

                totalPersonnel =
                    accounts.filter(
                        account =>
                            account.account_type === 'Personnel'
                    ).length;

            }

        } catch (accountError) {

            console.warn(
                'Account report unavailable:',
                accountError
            );

        }


        // =====================================
        // UPDATE SUMMARY CARDS
        // =====================================

        setText(
            '#report-total-reservations',
            totalReservations
        );

        setText(
            '#report-completed',
            completed
        );

        setupRevenueFilter();
        updateRevenueReport();


        // =====================================
        // CREATE CHARTS
        // =====================================

        createReservationChart(
            pending,
            approved,
            completed,
            declined
        );

        createAccountChart(
            totalClients,
            totalPersonnel
        );

        createPaymentChart(
            paid,
            unpaid
        );

    } catch (error) {

        console.error(
            'Reports loading error:',
            error
        );

        alert(
            'Unable to load report data.'
        );

    }

}

function setupRevenueFilter() {
    const filter = document.querySelector('#report-month-filter');
    if (!filter || filter.dataset.bound === 'true') return;

    filter.value = new Date().toISOString().slice(0, 7);
    filter.dataset.bound = 'true';
    filter.addEventListener('change', updateRevenueReport);
}

function updateRevenueReport() {
    const filter = document.querySelector('#report-month-filter');
    const selectedMonth = filter?.value || new Date().toISOString().slice(0, 7);
    const selectedYear = selectedMonth.slice(0, 4);

    const collectedRevenue = reportTransactions
        .filter(transaction => String(transaction.payment_date || '').slice(0, 7) === selectedMonth)
        .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

    const unpaidBalance = reportReservations
        .filter(reservation => reservation.payment_status === 'Unpaid')
        .reduce((total, reservation) => total + Number(reservation.amount || 0), 0);

    setText('#report-collected-revenue', formatCurrency(collectedRevenue));
    setText('#report-unpaid-balance', formatCurrency(unpaidBalance));
    createTransactionRevenueChart(reportTransactions, selectedYear);
}

function formatCurrency(value) {
    return `₱${Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function createTransactionRevenueChart(transactions, year) {
    const canvas = document.querySelector('#revenue-chart');
    if (!canvas) return;
    if (revenueChart) revenueChart.destroy();

    const monthlyRevenue = new Array(12).fill(0);
    transactions.forEach(transaction => {
        const paymentDate = String(transaction.payment_date || '');
        if (!paymentDate.startsWith(year + '-')) return;
        const month = Number(paymentDate.slice(5, 7)) - 1;
        if (month >= 0 && month < 12) monthlyRevenue[month] += Number(transaction.amount || 0);
    });

    revenueChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{ label: `Collected Revenue (${year})`, data: monthlyRevenue }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { callback: value => formatCurrency(value) } }
            }
        }
    });
}


// =====================================
// SET TEXT
// =====================================

function setText(selector, value) {

    const element =
        document.querySelector(selector);

    if (element) {
        element.textContent = value;
    }

}


// =====================================
// RESERVATION CHART
// =====================================

function createReservationChart(
    pending,
    approved,
    completed,
    declined
) {

    const canvas =
        document.querySelector(
            '#reservation-chart'
        );

    if (!canvas) return;

    if (reservationChart) {
        reservationChart.destroy();
    }

    reservationChart =
        new Chart(canvas, {

            type: 'doughnut',

            data: {

                labels: [
                    'Pending',
                    'Approved',
                    'Completed',
                    'Declined'
                ],

                datasets: [{
                    data: [
                        pending,
                        approved,
                        completed,
                        declined
                    ]
                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        position: 'bottom'
                    }

                }

            }

        });

}


// =====================================
// ACCOUNT CHART
// =====================================

function createAccountChart(
    clients,
    personnel
) {

    const canvas =
        document.querySelector(
            '#account-chart'
        );

    if (!canvas) return;

    if (accountChart) {
        accountChart.destroy();
    }

    accountChart =
        new Chart(canvas, {

            type: 'bar',

            data: {

                labels: [
                    'Clients',
                    'Personnel'
                ],

                datasets: [{

                    label:
                        'Number of Accounts',

                    data: [
                        clients,
                        personnel
                    ]

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {
                            precision: 0
                        }

                    }

                },

                plugins: {

                    legend: {
                        display: false
                    }

                }

            }

        });

}


// =====================================
// PAYMENT CHART
// =====================================

function createPaymentChart(
    paid,
    unpaid
) {

    const canvas =
        document.querySelector(
            '#payment-chart'
        );

    if (!canvas) return;

    if (paymentChart) {
        paymentChart.destroy();
    }

    paymentChart =
        new Chart(canvas, {

            type: 'pie',

            data: {

                labels: [
                    'Paid',
                    'Unpaid'
                ],

                datasets: [{

                    data: [
                        paid,
                        unpaid
                    ]

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        position: 'bottom'
                    }

                }

            }

        });

}


// =====================================
// REVENUE CHART
// =====================================

function createRevenueChart(
    reservations
) {

    const canvas =
        document.querySelector(
            '#revenue-chart'
        );

    if (!canvas) return;

    if (revenueChart) {
        revenueChart.destroy();
    }


    const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];

    const monthlyRevenue =
        new Array(12).fill(0);


    reservations.forEach(
        reservation => {

            if (
                reservation.payment_status !==
                'Paid'
            ) {
                return;
            }

            if (
                !reservation.payment_date
            ) {
                return;
            }

            const date =
                new Date(
                    reservation.payment_date
                );

            const month =
                date.getMonth();

            monthlyRevenue[month] +=
                Number(
                    reservation.amount || 0
                );

        }
    );


    revenueChart =
        new Chart(canvas, {

            type: 'bar',

            data: {

                labels: monthNames,

                datasets: [{

                    label:
                        'Revenue (₱)',

                    data:
                        monthlyRevenue

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback:
                                function(value) {

                                    return '₱' +
                                        Number(value)
                                            .toLocaleString();

                                }

                        }

                    }

                }

            }

        });

}


// =====================================
// START
// =====================================

loadReports();