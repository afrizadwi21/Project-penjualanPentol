const express = require('express')
const { supabaseRest } = require('../lib/supabaseRest')
const { jsonError } = require('../lib/http')
const { normalizePhone } = require('../utils/phone')
const { toOrderCode } = require('../utils/codes')

const router = express.Router()

router.get('/products', async (req, res) => {
  try {
    const rows = await supabaseRest('products', {
      query: 'select=id,name,price_idr,is_active&is_active=eq.true&order=created_at.desc',
    })
    res.json({ ok: true, data: rows })
  } catch (e) {
    jsonError(res, e.status || 500, 'Failed to load products', e.details || e.message)
  }
})

// BARU: Cek riwayat berdasarkan nomor telepon
router.get('/check-history', async (req, res) => {
  try {
    const { phone, name } = req.query
    console.log('[DEBUG] History search request:', { phone, name })
    if (!phone && !name) return jsonError(res, 400, 'Nomor telepon atau nama diperlukan')
    
    let queryOrder = ''
    let queryPreorder = ''

    if (phone) {
      const normalized = normalizePhone(phone)
      // Menggunakan * sebagai wildcard PostgREST
      const filter = `customer_phone=ilike.*${normalized}*`
      queryOrder = filter
      queryPreorder = filter
    } else if (name) {
      const filter = `customer_name=ilike.*${name}*`
      queryOrder = filter
      queryPreorder = filter
    }
    
    const [orders, preorders] = await Promise.all([
      supabaseRest('orders', {
        query: `${queryOrder}&order=ordered_at.desc`,
        useService: true
      }),
      supabaseRest('preorders', {
        query: `${queryPreorder}&order=ordered_at.desc`,
        useService: true
      })
    ])

    console.log('[DEBUG] Found records:', { ordersCount: orders?.length, preordersCount: preorders?.length })

    res.json({ 
      ok: true, 
      data: { orders, preorders } 
    })
  } catch (e) {
    console.error('[DEBUG] History search error:', e.message)
    jsonError(res, e.status || 500, 'Gagal mengambil riwayat', e.message)
  }
})

router.post('/orders', async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_class,
      customer_major,
      product_id,
      qty,
      total_idr,
    } = req.body || {}

    const phone = normalizePhone(customer_phone)
    if (!customer_name || !customer_class || !customer_major || !product_id) {
        return jsonError(res, 400, 'Missing required fields')
    }
    
    const order_code = toOrderCode('ORD')
    
    const result = await supabaseRest('orders', {
      method: 'POST',
      body: {
        order_code,
        customer_name,
        customer_phone: phone,
        customer_class,
        customer_major,
        product_id,
        qty,
        total_idr,
        payment_status: 'paid',
        status: 'done',
      },
      useService: true,
    })

    res.status(201).json({ ok: true, data: result[0] || result })
  } catch (e) {
    jsonError(res, e.status || 500, 'Failed to create order', e.details || e.message)
  }
})

router.post('/preorders', async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_class,
      customer_major,
      product_id,
      qty,
      total_idr,
      pay_method,
      proof_image_url,
    } = req.body || {}

    const phone = normalizePhone(customer_phone)
    const po_code = toOrderCode('PO')
    
    const result = await supabaseRest('preorders', {
      method: 'POST',
      body: {
        po_code,
        customer_name,
        customer_phone: phone,
        customer_class,
        customer_major,
        product_id,
        qty,
        total_idr,
        pay_method,
        payment_status: pay_method === 'qris' ? (proof_image_url ? 'submitted' : 'unpaid') : 'unpaid',
        status: 'waiting_payment',
        proof_image_url: proof_image_url || null,
      },
      useService: true,
    })

    res.status(201).json({ ok: true, data: result[0] || result })
  } catch (e) {
    jsonError(res, e.status || 500, 'Failed to create preorder', e.details || e.message)
  }
})

module.exports = { publicRouter: router }
