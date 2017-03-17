(function() {
    var wheel = require('../utils/base.js').wheel;

    wheel(
        'simulator.TextSmall',
        wheel.Class(wheel.simulator.Text, function(supr) {
           this.init = function(opts) {
                opts.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAANOCAYAAAAs5k1nAAAEmUlEQVR4nO2W0bKDMAhE+/8/7X2qo2EXlpBo9NaZTls9wkII5LM11+fzOf9/J2BeSFk4Pvz+1gH0sE/k8kA9UfCDLNBMUoCZNxrgbxlgV77kaB5QiEbkMTxXA8wDEmnWwgXCVCMLEDCCkfKjpc/pj1IPEJBFHi1IRQtXE1po/UIN7nKbmygPNYBpoFGYPKAw4WpSoNUAUx1GIQP1ifMYoL4vlgYQlMvDBS5WAWrLDd3JLlhDp3Ozz4KrQY7iAkAa7nmAHZPC6T9JpHnhnwLScXGyhn5APg1O1PADmhvD9ma4mi4w+SRWA8acQGjZs3Pty4D9RrT93ekvdblnA1KfnFxR6HIBdzX7js3ooQHCI0otUdB/F5CaejkX47Zea5G24nDz0qKlLsx+QIB0IpWi6AekkjOWxgOPqKiwiZkXvIcGWH6wIqFhFJNasQTQXi0BtbFYK/tVVvNuDSuI7IpiQtm3OTAAtJQGamX/Hg0hsILIyT1K0tBapJ3WrWroIpyboQVJAwQ9ILSgA3RmjtNwgYsxwGrLPbFoQ8Dt9sb3vGNSvcvV22DYxPoSRRfqWw873Z4+WuAIUQvGIrMgHXLcPNDdPWZe0IJxgbBoJYCeBuXVpAByMSmK/jBZJCaKOuBqQJAukq3FbmEFgEFmZ7k16VYUMx+K1Kv6JiCXBwaFRWss1IFHaFhR5AQXNQAJDS3c2aPMasozywWM6ZSLiwC3qlcQebrBmtgROv1/HxDmQUpU6+ZlAMqBAZAlCrhNjGqAllqRRkfKgqRBiuKkywNCCy8F3D5Jh4oMsO/BAPo9ATChsjzkAeQqD8hRuJmUgGNkGmBupnf3BaO5DoRRnN7w8tB+DJDSMAlIixwMtDpCC3dWFNyb8EFUMBCAMHrTJIot9UQAakACcxbSInfXpz8s1d31EFrYgVADfbvttGmRuTzQDzILw/wHwAoj6RFTbxWRchQtnAOgKwmoT5xxAPoeBMD4U4t1cVW3cG65XQuTw/wnG6cOpKZea40C7nCvVxQE6JJ7D0+AlAfa7SWR7wIm5wFBeaCFJgFHKAeEmRwncmlAysNdE8e7fsBiQGqoXdRhQgsvB9p1CC3kTyDucsNpkwK6XGybekRJATSTbQM1UdTzIAHp5c4DrouuKEILdSCsqJMFaL50Mpc03FEwUA8TCaNA190VFe6Lek32VZQLQDcygPwPdnERgK5aRT1i4+Qq6jf1RIBdcG+6QN3CIwDzArzJOoxkwe1RsotJAGqiBoDWugF3d1OR0FIbRahBCtPVQKOg4A/AgHlBAtBKntbCjKF2JNGlXgnwLh14x1AbN/VcIH0CWTIPbhTsWq6i0msxGGBXraJqy20stC6MBShwPrBtPYnaTaOidY8oRwtLA+ia3KNyQOsiFBl2GNofZBdUJAUkFyvUg1QwtUS5wAoz66Y2uG3XJqqFaJerAbtfr2AmVRQSt7tLAeh7END6PkEywK7+iurT0IYJNUhzE1pYMVHfe0tunNoRBV25RLnHAyYWApPClI4ochT9IuuAPLsnAy10h4bnA7/VxA9PgGl/x71pBvqcI+vKwB+6VQLTawKRQQAAAABJRU5ErkJggg==';
                supr(this, 'init', [opts]);
           };
        })
    );
})();