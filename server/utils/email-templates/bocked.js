exports.productBlockedNotification = function (sellerName, productName, reason, supportEmail) {
    return new Promise(async (resolve, reject) => {
      try {
        let template = `
            <html style="box-sizing: border-box;">
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body, html {
                    padding: 0px !important;
                    margin: 0px !important;
                    font-family: sans-serif !important;
                  }
                  .logo {
                    max-height: 70px !important;
                  }
                  .container {
                    padding: 20px;
                  }
                  .banner {
                    background-color: #dc3545 !important;
                    color: #ffffff;
                  }
                  .text-dark {
                    color: #000000 !important;
                  }
                  .text-muted {
                    color: #6c757d !important;
                  }
                  .btn {
                    align-items: center;
                    padding: 6px 14px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
                    border-radius: 6px;
                    border: none;
                    background: #6E6D70;
                    box-shadow: 0px 0.5px 1px rgba(0, 0, 0, 0.1), inset 0px 0.5px 0.5px rgba(255, 255, 255, 0.5), 0px 0px 0px 0.5px rgba(0, 0, 0, 0.12);
                    color: #DFDEDF;
                  }
                  .btn:hover {
                    color: #6E6D70;
                    background:#DFDEDF ;
                  }
                  .warning-text {
                    font-size: 12px;
                  }
                </style>
              </head>
              <body>
                <div class="col-12 banner">
                  <div class="container">
                    <h2>Product Blocked </h2>
                  </div>
                </div>
                <div class="container">
                  <div class="p-3">
                    <p>Dear ${sellerName},</p>
                    <p>We regret to inform you that your product "<strong>${productName}</strong>" has been blocked by the admin. Below is the reason provided:</p>
                    <blockquote class="text-dark">
                      "${reason}"
                    </blockquote>
                    <p>If you believe this action was taken in error or if you have any questions, please feel free to contact our support team for further clarification.</p>
                    <a href="mailto:${supportEmail}">
                      <button class="btn">Contact Support</button>
                    </a>
                    <p class="text-muted warning-text mt-3">
                      Please note that this action was taken in accordance with our policies to ensure compliance and maintain quality standards on the platform.
                    </p>
                    <br>
                    <p>Thank you for your understanding,</p>
                    <p>The Team</p>
                  </div>
                </div>
              </body>
            </html>
        `;
        resolve(template);
      } catch (error) {
        reject(error);
      }
    });
  };
  