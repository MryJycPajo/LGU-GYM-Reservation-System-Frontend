
// =====================================
// ADMIN REPORTS
// =====================================

const API_URL = 'http://localhost:3001/api';

let reservationChart = null;
let accountChart = null;
let paymentChart = null;
let monthlyChart = null;
let revenueChart = null;


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
        // REVENUE
        // =====================================

        const totalRevenue =
            reservations
                .filter(
                    r => r.payment_status === 'Paid'
                )
                .reduce(
                    (total, r) =>
                        total + Number(r.amount || 0),
                    0
                );


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
            '#report-total-clients',
            totalClients
        );

        setText(
            '#report-total-personnel',
            totalPersonnel
        );

        setText(
            '#report-total-reservations',
            totalReservations
        );

        setText(
            '#report-completed',
            completed
        );


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

        createMonthlyChart(
            reservations
        );

        createRevenueChart(
            reservations
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
// MONTHLY RESERVATIONS
// =====================================

function createMonthlyChart(
    reservations
) {

    const canvas =
        document.querySelector(
            '#monthly-chart'
        );

    if (!canvas) return;

    if (monthlyChart) {
        monthlyChart.destroy();
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

    const monthlyCounts =
        new Array(12).fill(0);


    reservations.forEach(
        reservation => {

            if (
                !reservation.reservation_date
            ) {
                return;
            }

            const date =
                new Date(
                    reservation.reservation_date
                );

            const month =
                date.getMonth();

            monthlyCounts[month]++;

        }
    );


    monthlyChart =
        new Chart(canvas, {

            type: 'line',

            data: {

                labels: monthNames,

                datasets: [{

                    label:
                        'Reservations',

                    data:
                        monthlyCounts,

                    tension: 0.3,

                    fill: false

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