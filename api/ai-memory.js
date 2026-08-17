/** Optional non-canonical viewer persistence. Local browser memory is always the fallback. */
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  const url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
  const token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
  if(!url||!token)return res.status(503).json({ok:false,mode:'local-only',reason:'persistent_store_not_configured'});
  const id=String(req.query?.id||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80);
  if(!id)return res.status(400).json({ok:false,error:'id_required'});
  const key=`kxtxr:viewer:${id}`;
  const call=async cmd=>{const r=await fetch(`${url}/${cmd}`,{headers:{Authorization:`Bearer ${token}`}});if(!r.ok)throw new Error(`store_${r.status}`);return r.json()};
  try{
    if(req.method==='GET'){const out=await call(`get/${encodeURIComponent(key)}`);return res.status(200).json({ok:true,mode:'persistent',memory:out.result?JSON.parse(out.result):null})}
    if(req.method==='POST'){
      const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
      const safe={version:2,lastSeen:new Date().toISOString(),lastScene:Number(body?.lastScene||0),visits:Number(body?.visits||0),scenes:body?.scenes||{},panels:body?.panels||{}};
      await call(`set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(safe))}`);
      return res.status(200).json({ok:true,mode:'persistent'});
    }
    return res.status(405).json({ok:false,error:'method_not_allowed'});
  }catch(e){return res.status(500).json({ok:false,error:String(e.message||e)})}
}
