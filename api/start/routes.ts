import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const IndicatorsController = () => import('#controllers/indicators_controller')
const ViewersController = () => import('#controllers/viewers_controller')
const SyncController = () => import('#controllers/sync_controller')

router.get('/', () => {
  return { name: 'pulse-fx' }
})

router.get('/indicators', [IndicatorsController, 'index'])
router.get('/indicators/:code', [IndicatorsController, 'show'])
router.post('/viewers', [ViewersController, 'store'])
router.put('/viewers/:id/favorites/:code', [ViewersController, 'update'])
router.post('/admin/sync', [SyncController, 'store']).use(middleware.admin())
