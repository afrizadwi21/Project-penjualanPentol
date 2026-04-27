const express = require('express')
const { supabaseRest } = require('../lib/supabaseRest')
const { jsonError } = require('../lib/http')
const { requireAdmin } = require('../middleware/requireAdmin')

const router = express.Router()

router.use(requireAdmin)

router.get('/orders', async (req, res) => {
  try {
    const rows = await supabaseRest('orders', {
      query: 'select=*&order=ordered_at.desc&limit=1000',
      useService: true,
    })
    res.json({ ok: true, data: rows })
  } catch (e) {
    jsonError(res, e.status || 500, 'Failed to load orders', e.details || e.message)
  }
})

router.get('/preorders', async (req, res) => {
  try {
    const rows = await supabaseRest('preorders', {
      query: 'select=*&order=ordered_at.desc&limit=1000',
      useService: true,
    })
    
    // LOG UNTUK PENGECEKAN KOLOM
    if (rows && rows.length > 0) {
      console.log('[DEBUG] Preorder column keys:', Object.keys(rows[0]))
      console.log('[DEBUG] First row ID:', rows[0].id)
    } else {
      console.log('[DEBUG] No preorders found in DB')
    }

    res.json({ ok: true, data: rows })
  } catch (e) {
    jsonError(res, e.status || 500, 'Failed to load preorders', e.details || e.message)
  }
})

router.patch('/preorders/:id', async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body || {}
    
    console.log('[DEBUG] --- PATCH REQUEST RECEIVED ---')
    console.log('[DEBUG] Method:', req.method)
    console.log('[DEBUG] Path:', req.path)
    console.log('[DEBUG] Target ID:', id)
    console.log('[DEBUG] Body:', JSON.stringify(body))

    if (!id || id === 'undefined') {
        console.error('[DEBUG] ID is invalid:', id)
        return jsonError(res, 400, 'ID pesanan tidak valid (undefined)')
    }

    console.log('[DEBUG] --- START UPDATE ---')

    const patch = {}
    if (body.payment_status) patch.payment_status = body.payment_status
    if (body.status) patch.status = body.status
    
    if (body.status === 'ready_pickup') {
      patch.admin_note = 'Pembayaran sudah diterima admin. Pesanan sudah siap diambil.'
      patch.payment_status = 'paid'
    } else if (body.status === 'paid') {
      patch.admin_note = 'Pesanan sudah selesai diambil. Terima kasih!'
      patch.payment_status = 'paid'
    }

    const result = await supabaseRest('preorders', {
      method: 'PATCH',
      query: `id=eq.${id}`,
      body: patch,
      useService: true,
    })

    console.log('[DEBUG] DB Update Result:', JSON.stringify(result))
    console.log('[DEBUG] --- END UPDATE ---')
    
    res.json({ ok: true, data: result })
  } catch (e) {
    console.error('[DEBUG] Update Error:', e.message)
    jsonError(res, e.status || 500, 'Update failed', e.message)
  }
})

router.get('/sales/daily', async (req, res) => {
  try {
    const rows = await supabaseRest('sales_daily', {
      query: 'select=day,revenue_idr,qty&order=day.asc',
      useService: true,
    })
    res.json({ ok: true, data: rows })
  } catch (e) {
    jsonError(res, e.status || 500, 'Failed to load sales daily', e.details || e.message)
  }
})

module.exports = { adminRouter: router }
