'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Camera, 
  Wifi, 
  Server, 
  HardDrive, 
  Cpu, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Button } from '@tecbunny/ui';
import { useAnalytics } from '@tecbunny/core';

type CalculatorTab = 'cctv' | 'network' | 'wifi';

export function CommercialInfrastructureCalculator({
  defaultTab = 'cctv',
  className = '',
}: {
  defaultTab?: CalculatorTab;
  className?: string;
}) {
  const { trackEvent } = useAnalytics();
  const [activeTab, setActiveTab] = React.useState<CalculatorTab>(defaultTab);

  // CCTV State
  const [cctvCameras, setCctvCameras] = React.useState<number>(16);
  const [cctvResolution, setCctvResolution] = React.useState<'1080p' | '4mp' | '4k'>('4mp');
  const [cctvFps, setCctvFps] = React.useState<number>(20);
  const [cctvDays, setCctvDays] = React.useState<number>(30);
  const [cctvCodec, setCctvCodec] = React.useState<'h264' | 'h265' | 'h265plus'>('h265plus');

  // Network State
  const [networkUsers, setNetworkUsers] = React.useState<number>(50);
  const [networkWorkstations, setNetworkWorkstations] = React.useState<number>(40);
  const [networkProfile, setNetworkProfile] = React.useState<'standard' | 'heavy' | 'cloud_intensive'>('heavy');
  const [dualIsp, setDualIsp] = React.useState<boolean>(true);

  // Wi-Fi State
  const [wifiRooms, setWifiRooms] = React.useState<number>(30);
  const [wifiPublicZones, setWifiPublicZones] = React.useState<number>(4);
  const [wifiGuestLoad, setWifiGuestLoad] = React.useState<'standard' | 'high_density'>('high_density');

  // CCTV Storage Calculation (Formula based on industry bitrates)
  // Base bitrate per camera in Mbps:
  // 1080p: ~2.0 Mbps (H.265+) / 4.0 Mbps (H.264)
  // 4MP: ~4.0 Mbps (H.265+) / 8.0 Mbps (H.264)
  // 4K: ~8.0 Mbps (H.265+) / 16.0 Mbps (H.264)
  const calculateCctvStorage = () => {
    let baseBitrateMbps = 4.0;
    if (cctvResolution === '1080p') baseBitrateMbps = 2.0;
    if (cctvResolution === '4k') baseBitrateMbps = 8.0;

    // Codec multiplier
    let codecFactor = 1.0;
    if (cctvCodec === 'h264') codecFactor = 2.0;
    if (cctvCodec === 'h265') codecFactor = 1.35;
    if (cctvCodec === 'h265plus') codecFactor = 0.85;

    // FPS factor (normalized to 20fps baseline)
    const fpsFactor = cctvFps / 20;

    // Total Mbps
    const totalBitrateMbps = cctvCameras * baseBitrateMbps * codecFactor * fpsFactor;

    // Gigabytes per day: (Mbps * 3600 * 24) / (8 * 1000)
    const gbPerDay = (totalBitrateMbps * 86400) / 8000;
    const totalTbRaw = (gbPerDay * cctvDays) / 1000;

    // Add 20% RAID / formatting overhead
    const recommendedTb = Math.ceil(totalTbRaw * 1.2);
    const driveCount = Math.max(2, Math.ceil(recommendedTb / 8)); // Assuming 8TB or 10TB enterprise surveillance drives

    return {
      totalTb: totalTbRaw.toFixed(1),
      recommendedStorageTb: recommendedTb,
      recommendedDrives: `${driveCount}x ${Math.ceil(recommendedTb / driveCount)}TB Surveillance Drives (RAID-1/5)`,
      totalBitrateMbps: Math.round(totalBitrateMbps),
      recommendedNvr: cctvCameras <= 8 ? '8-Channel 4K NVR' : cctvCameras <= 16 ? '16-Channel 4K NVR' : cctvCameras <= 32 ? '32-Channel Rackmount NVR' : '64-Channel Dual-PSU NVR'
    };
  };

  // Network Infrastructure Calculation
  const calculateNetwork = () => {
    const totalConnectedDevices = (networkUsers * 2.2) + networkWorkstations + 15; // IoT, printers, APs
    let perUserBandwidthMbps = 10;
    if (networkProfile === 'standard') perUserBandwidthMbps = 5;
    if (networkProfile === 'cloud_intensive') perUserBandwidthMbps = 20;

    const recommendedWanMbps = Math.max(100, Math.round(networkUsers * perUserBandwidthMbps * 0.7)); // 70% concurrency factor
    const requiredSwitchPorts = Math.ceil((networkWorkstations + 12) * 1.25); // 25% future growth
    const switchUnits = Math.ceil(requiredSwitchPorts / 24);

    return {
      totalDevices: Math.round(totalConnectedDevices),
      recommendedWan: `${recommendedWanMbps} Mbps Dedicated ${dualIsp ? '+ Redundant Backup WAN' : ''}`,
      switchPorts: `${requiredSwitchPorts} Ports (${switchUnits}x 24-Port or 48-Port PoE+ Managed Switches)`,
      serverRackUnits: '12U - 24U Floor/Wall Enclosure with PDU & Patch Panels',
      upsRating: networkUsers > 60 ? '3kVA - 5kVA Online Double-Conversion UPS' : '1.5kVA - 2kVA Online UPS'
    };
  };

  // Wi-Fi Calculation
  const calculateWifi = () => {
    // Rooms: assume 1 AP per 2 rooms in laterite/concrete, or 1 in-wall AP per luxury room
    const roomAps = Math.ceil(wifiRooms / 2);
    const publicAps = wifiPublicZones * 2;
    const totalAps = roomAps + publicAps;
    const maxConcurrentClients = wifiRooms * (wifiGuestLoad === 'high_density' ? 3.5 : 2.0) + (wifiPublicZones * 35);

    return {
      totalAps,
      roomAps: `${roomAps} In-Room / Corridor Wi-Fi 6 APs`,
      publicAps: `${publicAps} High-Density Outdoor / Restaurant APs`,
      maxConcurrentClients: Math.round(maxConcurrentClients),
      controller: totalAps > 20 ? 'Cloud / On-Premises Hardware Gateway Controller' : 'Embedded Gateway Controller'
    };
  };

  const cctvResults = calculateCctvStorage();
  const networkResults = calculateNetwork();
  const wifiResults = calculateWifi();

  return (
    <div className={`rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-10 shadow-2xl backdrop-blur-md ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-850 pb-6 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
            <Sparkles size={13} /> Engineering Planning Tool
          </span>
          <h3 className="text-2xl font-bold text-white font-tech mt-2">
            Commercial Infrastructure Sizing Calculator
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Calculate preliminary storage, bandwidth, and hardware requirements for commercial projects in Goa.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('cctv');
              trackEvent('resource_cta_clicked', { cta: 'calculator_tab_cctv' });
            }}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
              activeTab === 'cctv' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Camera size={14} />
            <span>CCTV Storage</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('network');
              trackEvent('resource_cta_clicked', { cta: 'calculator_tab_network' });
            }}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
              activeTab === 'network' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Server size={14} />
            <span>Network Sizing</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('wifi');
              trackEvent('resource_cta_clicked', { cta: 'calculator_tab_wifi' });
            }}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
              activeTab === 'wifi' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wifi size={14} />
            <span>Hospitality Wi-Fi</span>
          </button>
        </div>
      </div>

      {/* CCTV CALCULATOR */}
      {activeTab === 'cctv' && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-300 mb-2">
                <label htmlFor="camera-count">Number of IP Security Cameras:</label>
                <span className="font-mono text-blue-400 font-bold text-sm">{cctvCameras} Cameras</span>
              </div>
              <input
                id="camera-count"
                type="range"
                min="4"
                max="64"
                step="2"
                value={cctvCameras}
                onChange={(e) => setCctvCameras(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                <span>4 cams</span>
                <span>16 cams</span>
                <span>32 cams</span>
                <span>64 cams</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Camera Resolution</label>
                <select
                  value={cctvResolution}
                  onChange={(e) => setCctvResolution(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="1080p">1080p Full HD (2MP)</option>
                  <option value="4mp">4MP ColorVu / Ultra HD</option>
                  <option value="4k">4K (8MP Commercial)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Video Compression Codec</label>
                <select
                  value={cctvCodec}
                  onChange={(e) => setCctvCodec(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="h265plus">H.265+ Smart Codec (Recommended)</option>
                  <option value="h265">Standard H.265</option>
                  <option value="h264">Legacy H.264</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-300 mb-2">
                <label htmlFor="retention-days">Required Video Retention Window:</label>
                <span className="font-mono text-blue-400 font-bold text-sm">{cctvDays} Days</span>
              </div>
              <input
                id="retention-days"
                type="range"
                min="7"
                max="90"
                step="1"
                value={cctvDays}
                onChange={(e) => setCctvDays(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                <span>7 days</span>
                <span>30 days (Standard)</span>
                <span>60 days</span>
                <span>90 days (Compliance)</span>
              </div>
            </div>
          </div>

          {/* Results Box */}
          <div className="lg:col-span-5 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/30 to-zinc-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-xs uppercase font-mono font-bold text-blue-400">Estimated Sizing</span>
              <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">H.265+ 24/7 Feed</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-zinc-400 block">Recommended Usable Storage:</span>
                <p className="text-2xl sm:text-3xl font-black text-white font-tech text-blue-400">
                  {cctvResults.recommendedStorageTb} TB <span className="text-xs text-zinc-400 font-normal font-sans">(Raw: {cctvResults.totalTb} TB)</span>
                </p>
              </div>

              <div className="text-xs space-y-1.5 pt-2 border-t border-zinc-800/60">
                <div className="flex justify-between"><span className="text-zinc-400">Drive Configuration:</span> <strong className="text-zinc-200 text-right">{cctvResults.recommendedDrives}</strong></div>
                <div className="flex justify-between"><span className="text-zinc-400">Recommended NVR:</span> <strong className="text-zinc-200">{cctvResults.recommendedNvr}</strong></div>
                <div className="flex justify-between"><span className="text-zinc-400">Total Ingestion Throughput:</span> <strong className="text-zinc-200 font-mono">~{cctvResults.totalBitrateMbps} Mbps</strong></div>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs h-10 shadow-lg shadow-blue-500/20">
                <Link href={`/assessment?service=physical-security&cams=${cctvCameras}&storage=${cctvResults.recommendedStorageTb}`}>
                  Request CCTV Proposal with This Sizing &rarr;
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* NETWORK SIZING CALCULATOR */}
      {activeTab === 'network' && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-300 mb-2">
                <label htmlFor="network-users">Active Staff / Users Count:</label>
                <span className="font-mono text-blue-400 font-bold text-sm">{networkUsers} Users</span>
              </div>
              <input
                id="network-users"
                type="range"
                min="10"
                max="250"
                step="5"
                value={networkUsers}
                onChange={(e) => setNetworkUsers(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Dedicated Workstations</label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={networkWorkstations}
                  onChange={(e) => setNetworkWorkstations(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Workload Profile</label>
                <select
                  value={networkProfile}
                  onChange={(e) => setNetworkProfile(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="standard">Standard Web &amp; Email</option>
                  <option value="heavy">Heavy Zoom / VoIP / CRM</option>
                  <option value="cloud_intensive">Cloud CAD / 4K Media Editing</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-850 p-3.5 rounded-xl">
              <input
                type="checkbox"
                id="dual-isp-check"
                checked={dualIsp}
                onChange={(e) => setDualIsp(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500/40 accent-blue-600"
              />
              <label htmlFor="dual-isp-check" className="text-xs text-zinc-300 cursor-pointer">
                <strong>Include Dual-ISP Auto-Failover Architecture</strong> (Zero downtime during fiber cuts)
              </label>
            </div>
          </div>

          {/* Results Box */}
          <div className="lg:col-span-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-zinc-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-xs uppercase font-mono font-bold text-indigo-400">Network Sizing Estimate</span>
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">Managed LAN</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-zinc-400 block">Recommended Internet Bandwidth:</span>
                <p className="text-xl sm:text-2xl font-black text-white font-tech text-indigo-400">
                  {networkResults.recommendedWan}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                <div><span className="text-zinc-400 block text-[11px]">Core Switching Capacity:</span> <strong className="text-zinc-200">{networkResults.switchPorts}</strong></div>
                <div><span className="text-zinc-400 block text-[11px]">Server Rack Enclosure:</span> <strong className="text-zinc-200">{networkResults.serverRackUnits}</strong></div>
                <div><span className="text-zinc-400 block text-[11px]">Power Backup UPS:</span> <strong className="text-zinc-200">{networkResults.upsRating}</strong></div>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs h-10 shadow-lg shadow-blue-500/20">
                <Link href={`/assessment?service=network-infrastructure&users=${networkUsers}`}>
                  Request Network Design Proposal &rarr;
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* HOSPITALITY WI-FI CALCULATOR */}
      {activeTab === 'wifi' && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-300 mb-2">
                <label htmlFor="wifi-rooms">Guest Rooms / Villas Count:</label>
                <span className="font-mono text-blue-400 font-bold text-sm">{wifiRooms} Keys</span>
              </div>
              <input
                id="wifi-rooms"
                type="range"
                min="6"
                max="120"
                step="2"
                value={wifiRooms}
                onChange={(e) => setWifiRooms(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Public Areas (Pool/Lobby/Dining)</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={wifiPublicZones}
                  onChange={(e) => setWifiPublicZones(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Guest Density Profile</label>
                <select
                  value={wifiGuestLoad}
                  onChange={(e) => setWifiGuestLoad(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="high_density">High-Density (3-4 devices/guest)</option>
                  <option value="standard">Standard (1-2 devices/guest)</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-850 bg-zinc-900/40 p-3.5 text-xs text-zinc-400 space-y-1">
              <span className="text-zinc-300 font-semibold block">Goa Masonry &amp; Laterite Consideration:</span>
              <p>For Portuguese villas and laterite structures with 350-450mm stone walls, ceiling-mounted corridor APs lose 65-80% signal power. In-wall per-room APs are strongly recommended.</p>
            </div>
          </div>

          {/* Results Box */}
          <div className="lg:col-span-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-zinc-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-xs uppercase font-mono font-bold text-emerald-400">Resort Wi-Fi Sizing</span>
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">Wi-Fi 6 (802.11ax)</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-zinc-400 block">Total Access Points Required:</span>
                <p className="text-2xl sm:text-3xl font-black text-white font-tech text-emerald-400">
                  {wifiResults.totalAps} Access Points
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                <div><span className="text-zinc-400 block text-[11px]">Room / Villa Coverage:</span> <strong className="text-zinc-200">{wifiResults.roomAps}</strong></div>
                <div><span className="text-zinc-400 block text-[11px]">Public Outdoor / F&amp;B Zones:</span> <strong className="text-zinc-200">{wifiResults.publicAps}</strong></div>
                <div><span className="text-zinc-400 block text-[11px]">Max Concurrent Guest Devices:</span> <strong className="text-zinc-200 font-mono">~{wifiResults.maxConcurrentClients} Devices</strong></div>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs h-10 shadow-lg shadow-blue-500/20">
                <Link href={`/assessment?industry=Hospitality&keys=${wifiRooms}&aps=${wifiResults.totalAps}`}>
                  Request Heatmap &amp; Wi-Fi Assessment &rarr;
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Disclaimer */}
      <div className="mt-8 pt-4 border-t border-zinc-850 flex items-start gap-2 text-[11px] text-zinc-500">
        <AlertCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
        <span>
          <strong>Preliminary planning estimate</strong> — Final storage and network capacity requires physical on-site RF heatmapping, cable path verification, and structural wall inspection by our certified engineers.
        </span>
      </div>
    </div>
  );
}
