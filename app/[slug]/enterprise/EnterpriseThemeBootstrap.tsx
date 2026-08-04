import {
  buildEnterpriseThemeBootstrapCss,
  buildEnterpriseThemeBootstrapScript,
  ENTERPRISE_HOME_THEME,
} from './lib/theme-bootstrap';

type Props = {
  initialColor?: string;
};

/** SSR + pre-hydrate: hijau Grab sebelum client JS, cegah flash biru DANA saat refresh. */
export function EnterpriseThemeBootstrap({
  initialColor = ENTERPRISE_HOME_THEME,
}: Props) {
  return (
    <>
      <style
        id="enterprise-theme-bootstrap"
        dangerouslySetInnerHTML={{
          __html: buildEnterpriseThemeBootstrapCss(initialColor),
        }}
      />
      <script
        id="enterprise-theme-bootstrap-script"
        dangerouslySetInnerHTML={{
          __html: buildEnterpriseThemeBootstrapScript(initialColor),
        }}
      />
    </>
  );
}
