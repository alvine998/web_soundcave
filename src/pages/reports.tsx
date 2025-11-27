import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Reports() {
  const [reportType, setReportType] = useState('customers');
  const [dateRange, setDateRange] = useState('30days');

  const customers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      plan: 'Premium',
      joinDate: '2024-01-15',
      lastActive: '2 hours ago',
      totalSpent: '$149.99',
      status: 'active',
      country: 'USA',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      plan: 'Free',
      joinDate: '2024-02-10',
      lastActive: '1 day ago',
      totalSpent: '$0.00',
      status: 'active',
      country: 'UK',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.j@email.com',
      plan: 'Premium',
      joinDate: '2023-12-05',
      lastActive: '3 hours ago',
      totalSpent: '$299.99',
      status: 'active',
      country: 'Canada',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.w@email.com',
      plan: 'Basic',
      joinDate: '2024-01-20',
      lastActive: '1 week ago',
      totalSpent: '$49.99',
      status: 'inactive',
      country: 'Australia',
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.b@email.com',
      plan: 'Premium',
      joinDate: '2024-02-01',
      lastActive: '30 mins ago',
      totalSpent: '$199.99',
      status: 'active',
      country: 'USA',
    },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12400, customers: 120 },
    { month: 'Feb', revenue: 14200, customers: 145 },
    { month: 'Mar', revenue: 16800, customers: 168 },
    { month: 'Apr', revenue: 15600, customers: 156 },
    { month: 'May', revenue: 18900, customers: 189 },
    { month: 'Jun', revenue: 21200, customers: 212 },
  ];

  const subscriptionData = [
    { plan: 'Free', count: 450 },
    { plan: 'Basic', count: 280 },
    { plan: 'Premium', count: 520 },
  ];

  const stats = [
    {
      title: 'Total Customers',
      value: '2,543',
      change: '+12.5%',
      isPositive: true,
      icon: '👥',
    },
    {
      title: 'Active Users',
      value: '1,892',
      change: '+8.2%',
      isPositive: true,
      icon: '✓',
    },
    {
      title: 'Total Revenue',
      value: '$98,234',
      change: '+23.1%',
      isPositive: true,
      icon: '💰',
    },
    {
      title: 'Churn Rate',
      value: '3.4%',
      change: '-1.2%',
      isPositive: true,
      icon: '📊',
    },
  ];

  const handleExport = (format: string) => {
    alert(`Exporting report as ${format}...`);
  };

  return (
    <>
      <Head>
        <title>Customer Reports - SoundCave</title>
        <meta name="description" content="Customer Reports SoundCave" />
      </Head>

      <Layout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Reports</h1>
            <p className="text-gray-600">Analisis lengkap data customer dan revenue</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      stat.isPositive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filters and Export */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Side - Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="customers">Customer Report</option>
                  <option value="revenue">Revenue Report</option>
                  <option value="subscription">Subscription Report</option>
                  <option value="activity">Activity Report</option>
                </select>

                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-gray-900"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="1year">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Right Side - Export Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('PDF')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport('Excel')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => handleExport('CSV')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue Growth
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Subscription Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Subscription Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subscriptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="plan" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" name="Customers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Customer Details
                </h3>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search customers..."
                    className="pl-10"
                  />
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            customer.plan === 'Premium'
                              ? 'bg-purple-100 text-purple-700'
                              : customer.plan === 'Basic'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {customer.plan}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {customer.joinDate}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {customer.lastActive}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {customer.totalSpent}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            customer.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {customer.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View
                          </button>
                          <button className="text-gray-600 hover:text-gray-700 text-sm">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">5</span> of{' '}
                <span className="font-medium">2,543</span> customers
              </p>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  3
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

