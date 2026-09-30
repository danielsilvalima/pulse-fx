import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'indicators.index': { paramsTuple?: []; params?: {} }
    'indicators.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'viewers.store': { paramsTuple?: []; params?: {} }
    'viewers.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'code': ParamValue} }
    'sync.store': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'indicators.index': { paramsTuple?: []; params?: {} }
    'indicators.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
  }
  HEAD: {
    'indicators.index': { paramsTuple?: []; params?: {} }
    'indicators.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
  }
  POST: {
    'viewers.store': { paramsTuple?: []; params?: {} }
    'sync.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'viewers.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'code': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}