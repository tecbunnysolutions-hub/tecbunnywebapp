'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ApiStatus = {
  name: string;
  path: string;
  status: 'loading' | 'online' | 'offline' | 'error';
  responseTime?: number;
  statusCode?: number;
  method?: 'GET' | 'POST' | 'OPTIONS';
};

const INITIAL_ENDPOINTS: ApiStatus[] = [
  { name: 'Core System Health', path: '/api/health/live', status: 'loading' },
  { name: 'Database Readiness', path: '/api/health/ready', status: 'loading' },
  { name: 'Metadata Config', path: '/api/metadata', status: 'loading' },
  { name: 'Auth Session', path: '/api/auth/session', status: 'loading' },
  { name: 'Settings Public', path: '/api/settings?key=phone', status: 'loading' },
  { name: 'CORS Check', path: '/api/metadata', method: 'OPTIONS', status: 'loading' },
];

export default function DashboardPage() {
  const [endpoints, setEndpoints] = useState<ApiStatus[]>(INITIAL_ENDPOINTS);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const checkStatus = async () => {
    setRefreshing(true);
    const updatedEndpoints = await Promise.all(
      endpoints.map(async (endpoint) => {
        const start = performance.now();
        try {
          const res = await fetch(endpoint.path, {
            method: endpoint.method || 'GET',
            headers: {
              'Cache-Control': 'no-cache',
            }
          });
          const end = performance.now();
          
          return {
            ...endpoint,
            status: res.ok ? 'online' : 'error',
            statusCode: res.status,
            responseTime: Math.round(end - start),
          } as ApiStatus;
        } catch (error) {
          return {
            ...endpoint,
            status: 'offline',
            responseTime: 0,
          } as ApiStatus;
        }
      })
    );
    
    setEndpoints(updatedEndpoints);
    setRefreshing(false);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin-auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">API</span>
              </div>
              <span className="font-bold text-xl text-gray-900">TecBunny API Health Monitor</span>
            </div>
            <div>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Internal Microservices Status</h1>
            <p className="mt-2 text-sm text-gray-700">
              A real-time overview of the critical API endpoints supporting the TecBunny infrastructure.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={checkStatus}
              disabled={refreshing}
              className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {refreshing ? 'Pinging...' : 'Refresh Status'}
            </button>
          </div>
        </div>
        
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Service
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Endpoint
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Latency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {endpoints.map((endpoint) => (
                      <tr key={endpoint.name + endpoint.method}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {endpoint.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{endpoint.method || 'GET'}</code> {endpoint.path}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {endpoint.status === 'loading' && (
                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                              Checking...
                            </span>
                          )}
                          {endpoint.status === 'online' && (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
                              Operational
                            </span>
                          )}
                          {endpoint.status === 'error' && (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" aria-hidden="true" />
                              Degraded ({endpoint.statusCode})
                            </span>
                          )}
                          {endpoint.status === 'offline' && (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                              Unreachable
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {endpoint.responseTime !== undefined ? (
                            <span className={endpoint.responseTime > 500 ? 'text-yellow-600 font-medium' : ''}>
                              {endpoint.responseTime} ms
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
