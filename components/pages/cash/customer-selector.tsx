'use client'

import * as React from 'react'
const customers = ['María González · Luna', 'Carlos Rojas · Max', 'Ana Pérez · Simón', 'Cliente mostrador']
export function CustomerSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <div className="rounded-[2rem] bg-[#e8f3ef] p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0d5c5b]">Cliente y mascota</p><select aria-label="Asignar cliente" value={value} onChange={(e) => onChange(e.target.value)} className="mt-3 w-full rounded-xl border-0 bg-white px-4 py-3 text-sm font-semibold text-[#173b3b] outline-none"><option value="">Seleccionar cliente...</option>{customers.map((customer) => <option key={customer}>{customer}</option>)}</select><button onClick={() => onChange('Nuevo cliente · Sin mascota')} className="mt-3 text-xs font-bold text-[#d37c52]">+ Crear cliente rápido</button></div> }
