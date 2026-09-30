/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'indicators.index': {
    methods: ["GET","HEAD"]
    pattern: '/indicators'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/indicators_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/indicators_controller').default['index']>>>
    }
  }
  'indicators.show': {
    methods: ["GET","HEAD"]
    pattern: '/indicators/:code'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { code: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/indicators_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/indicators_controller').default['show']>>>
    }
  }
  'viewers.store': {
    methods: ["POST"]
    pattern: '/viewers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/viewers_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/viewers_controller').default['store']>>>
    }
  }
  'viewers.update': {
    methods: ["PUT"]
    pattern: '/viewers/:id/favorites/:code'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; code: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/viewers_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/viewers_controller').default['update']>>>
    }
  }
  'sync.store': {
    methods: ["POST"]
    pattern: '/admin/sync'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_controller').default['store']>>>
    }
  }
}
