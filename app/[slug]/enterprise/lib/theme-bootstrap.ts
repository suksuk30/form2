/** Warna awal enterprise — dipakai SSR bootstrap & client shell (bukan biru DANA). */
export const ENTERPRISE_HOME_THEME = '#00B14F';
export const ENTERPRISE_OVO_THEME = '#5b3db8';

/** Script inline — jalan sebelum React hydrate agar notch/nav bawah tidak flash biru. */
export function buildEnterpriseThemeBootstrapScript(initialColor: string): string {
  const color = JSON.stringify(initialColor);
  return `(function(){
    var c=${color};
    var d=document,h=d.documentElement,b=d.body;
    h.classList.add('enterprise-shell');
    h.dataset.enterpriseActive='1';
    h.dataset.enterpriseHomeColor=c;
    h.dataset.enterpriseTheme=c;
    h.style.setProperty('background-color',c,'important');
    b.style.setProperty('background-color',c,'important');
    h.style.setProperty('--enterprise-theme-color',c);
    h.style.setProperty('--landingpage-top-color',c);
    h.style.setProperty('--grab-safe-top','env(safe-area-inset-top, 0px)');
    h.style.setProperty('--grab-safe-bottom','env(safe-area-inset-bottom, 0px)');
    h.style.minHeight='100%';
    b.style.minHeight='100%';
    var meta=d.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',c);
    function bar(id,isBottom){
      var el=d.getElementById(id);
      if(!el){
        el=d.createElement('div');
        el.id=id;
        el.setAttribute('aria-hidden','true');
        el.style.cssText='position:fixed;left:0;right:0;z-index:2147483646;pointer-events:none;'+(isBottom?'bottom:0;height:env(safe-area-inset-bottom,0px)':'top:0;height:env(safe-area-inset-top,0px)');
        b.appendChild(el);
      }
      el.style.backgroundColor=c;
    }
    bar('enterprise-safe-top',0);
    bar('enterprise-safe-bottom',1);
  })();`;
}

export function buildEnterpriseThemeBootstrapCss(initialColor: string): string {
  return `
html.enterprise-shell,
html.enterprise-shell body {
  background: ${initialColor} !important;
  min-height: 100%;
}
html.enterprise-shell {
  --enterprise-theme-color: ${initialColor};
  --landingpage-top-color: ${initialColor};
  --grab-safe-top: env(safe-area-inset-top, 0px);
  --grab-safe-bottom: env(safe-area-inset-bottom, 0px);
}
html.enterprise-shell::before,
html.enterprise-shell::after,
#enterprise-safe-top,
#enterprise-safe-bottom {
  background: ${initialColor};
}
`.trim();
}
