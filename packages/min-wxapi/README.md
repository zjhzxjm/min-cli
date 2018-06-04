``` js
import Min from '@minlib/min'
import WxApi from '@minlib/min-wxapi'

Min.use(WxApi)

const wxApi = new WxApi({
  promisify: true,
  requestfix: true,
  interceptors: [],
  noPromiseAPI: []
})
```
