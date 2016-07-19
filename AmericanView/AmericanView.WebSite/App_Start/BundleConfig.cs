using System.Web.Optimization;

namespace AmericanView.WebSite
{
    public class BundleConfig
    {      
        public static void RegisterBundles(BundleCollection bundles)
        {
            /* -- SCRIPTS -- */
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                  "~/Content/jquery/jquery-{version}.js"));     

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                    "~/Content/bootstrap/js/bootstrap.js",
                    "~/Content/bootstrap/js/bootstrap-switch.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui/js").Include(
                      "~/Content/plugins/jquery-ui/jquery-ui.js"));
          
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                    "~/Content/modernizr/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/owlcarousel").Include(
                "~/Content/plugins/owl.carousel/owl-carousel/owl.carousel.min.js"));
            
            bundles.Add(new ScriptBundle("~/bundles/youtube").Include(
                "~/Content/plugins/youtube/simplePlayer.js"));

            bundles.Add(new ScriptBundle("~/bundles/countup").Include(
                "~/Content/plugins/contador/countUp.js"));

            /* -- CSS -- */
            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/kendo-ui/styles/web/kendo.common.css",
                "~/Content/kendo-ui/styles/web/kendo.metro.css",
                "~/Content/kendo-ui/styles/mobile/kendo.mobile.all.css",
                "~/Content/bootstrap/css/bootstrap.css",
                "~/Content/bootstrap/css/bootstrap-switch.css",
                "~/Content/bootstrap/css/mosaic-custom-bootstrap.css",
                "~/Content/default.css",
                "~/Content/plugins/owl.carousel/owl-carousel/owl.carousel.css",
                "~/Content/plugins/owl.carousel/owl-carousel/owl.theme.css"));
        }
    }
}
