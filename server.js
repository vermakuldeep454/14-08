const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/fontawesome', express.static(path.join(__dirname, 'fontawesome')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));


//const port = 3000;
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));


// Serve the default mode HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'default', 'index.html'));
});

// Serve the light mode HTML
app.get('/light-mode', (req, res) => {
  res.sendFile(path.join(__dirname, 'light-mode', 'index.html'));
});

// Serve the dark mode HTML
app.get('/dark-mode', (req, res) => {
  res.sendFile(path.join(__dirname, 'dark-mode', 'index.html'));
});


// Serve the HTML form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>WhatsApp Group Extractor and Number Retriever Software Tool</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="robots" content="index, follow">
        <meta name="author" content="Design Collection">
        <link id="favicon" rel="icon" type="image/x-icon" href="assets/images/favicon.png"/>
        <meta name="description" content="Discover our powerful software featuring two extractors: one for extracting numbers from WhatsApp groups and another for extracting entire group information. Enhance your data collection and management with ease">
        <meta name="keywords" content="WhatsApp group extractor, number retriever, WhatsApp contact extractor, group information extractor, WhatsApp data management, extract WhatsApp numbers, group data extraction software">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <link href="assets/css/dark-mode-bootstrap.min.css" rel="stylesheet">
        <link href="assets/css/dark-mode-custom.css" rel="stylesheet">
        <link href="fontawesome/css/fontawesome.css" rel="stylesheet">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet">
        <!-- DataTables CSS -->
        <link href="assets/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    </head>
    <body>
      <nav class="navbar navbar-expand-sm bg-dark navbar-dark border-bottom-primary">
        <div class="container">
          <a class="navbar-brand" href="index.html"><img src="assets/images/logo.png" class="img-fluid" alt="Logo"></a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapsibleNavbar">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="collapsibleNavbar">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link" href="index.html">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="default/index.html">Default</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="light-mode/index.html">Light Mode</a>
              </li>
              <li class="nav-item">
              <a class="nav-link" href="dark-mode/index.html">Dark Mode</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="./documentation/index.html" target="_blank">Documentation</a>
              </li>
              <li class="nav-item">
              <a class="nav-link" target="_blank" href="mailto:support@designcollection.in" target="_blank">Support</a>
           </li>
            </ul>
          </div>
        </div>
      </nav>
      
      <section class="bg-light ptb-100">
        <div class="container">
          <div class="row">
            <h1 class="text-center">WhatsApp Group Extractor</h1>
            <form action="/search" method="POST">
              <div class="mb-3">
                <label for="query" class="form-label">Search Query</label>
                <input type="text" class="form-control" id="query" name="query" required>
              </div>
              <div class="mb-3">
                <label for="timeLimit" class="form-label">Time Limit (minutes)</label>
                <input type="number" class="form-control" id="timeLimit" name="timeLimit" required>
              </div>
              <button type="submit" class="btn btn-primary">Search</button>
            </form>
          </div>
        </div>
      </section>

      <footer class="footer bg-dark">
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              <p class="text-center p-3 text-white">© Design Collection 2016</p>
            </div>
          </div>
        </div>
      </footer>
      
      <!-- DataTables and Bootstrap JS -->
      <script src="assets/js/jquery-3.4.1.min.js"></script>
      <script src="assets/js/jquery.dataTables.min.js"></script>
      <script src="assets/js/dataTables.bootstrap5.min.js"></script>
      <script src="assets/js/bootstrap.bundle.min.js"></script>
      <!-- Papa Parse -->
      <script src="assets/js/papaparse.min.js"></script>
    </body>
    </html>
  `);
});

// Handle form submission
app.post('/search', async (req, res) => {
  const query = req.body.query;
  const timeLimit = parseInt(req.body.timeLimit, 10) * 60 * 1000;
  const endTime = Date.now() + timeLimit;

  try {
    const results = await searchGoogle(query, timeLimit);
    const whatsappGroups = await extractWhatsAppGroups(results, endTime, timeLimit);

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Search Results</title>
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
          <link id="favicon" rel="icon" type="image/x-icon" href="assets/images/favicon.png"/>
          <link href="assets/css/dark-mode-bootstrap.min.css" rel="stylesheet">
          <link href="assets/css/dark-mode-custom.css" rel="stylesheet">
          <link href="assets/css/dataTables.bootstrap5.min.css" rel="stylesheet">
      </head>
      <body>
        <nav class="navbar navbar-expand-sm bg-dark navbar-dark border-bottom-primary">
          <div class="container">
            <a class="navbar-brand" href="index.html"><img src="assets/images/logo.png" class="img-fluid" alt="Logo"></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapsibleNavbar">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="collapsibleNavbar">
              <ul class="navbar-nav ms-auto">
              <li class="nav-item">
              <a class="nav-link" href="index.html">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="default/index.html">Default</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="light-mode/index.html">Light Mode</a>
            </li>
            <li class="nav-item">
            <a class="nav-link" href="dark-mode/index.html">Dark Mode</a>
            </li>
                <li class="nav-item">
                  <a class="nav-link" href="./documentation/index.html" target="_blank">Documentation</a>
                </li>
                <li class="nav-item">
                <a class="nav-link" target="_blank" href="mailto:support@designcollection.in" target="_blank">Support</a>
             </li>
              </ul>
            </div>
          </div>
        </nav>
        
        <section class="bg-light ptb-100">
          <div class="container">
            <div class="row">
             <div class="col-md-12">
              ${renderResults(whatsappGroups)}
              <span>
              <button id="downloadCsv" class="btn btn-primary mt-3">Download CSV</button>
              </span>
              </div>
            </div>
          </div>
        </section>

        <footer class="footer bg-dark">
          <div class="container">
            <div class="row">
              <div class="col-lg-12">
                <p class="text-center p-3 text-white">© Design Collection 2016</p>
              </div>
            </div>
          </div>
        </footer>
        
        <script src="assets/js/jquery-3.4.1.min.js"></script>
        <script src="assets/js/jquery.dataTables.min.js"></script>
        <script src="assets/js/dataTables.bootstrap5.min.js"></script>
        <script src="assets/js/bootstrap.bundle.min.js"></script>
        <script src="assets/js/papaparse.min.js"></script>
        <script>
          $(document).ready(function() {
            $('table').DataTable();
            
            // Download CSV functionality
            $('#downloadCsv').click(function() {
              const data = JSON.parse(document.getElementById('allData').value);
              const csv = Papa.unparse(data);
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              const url = URL.createObjectURL(blob);
              link.setAttribute('href', url);
              link.setAttribute('download', 'whatsapp_groups.csv');
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            });
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send(`<h1>Error occurred: ${error.message}</h1>`);
  }
});

// Function to perform a Google search using Puppeteer
async function searchGoogle(query, timeLimit) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: timeLimit });

  const results = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('div#search .g').forEach(result => {
      const title = result.querySelector('h3') ? result.querySelector('h3').innerText : '';
      const link = result.querySelector('a') ? result.querySelector('a').href : '';
      if (title && link) {
        items.push({ title, link });
      }
    });
    return items;
  });

  await browser.close();
  return results;
}

// Function to extract WhatsApp group links and names from the search results
async function extractWhatsAppGroups(results, endTime, timeLimit) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const whatsappGroups = [];

  for (const result of results) {
    if (Date.now() >= endTime) {
      console.log(`Extraction timeout reached. Stopping further processing.`);
      break;
    }

    const page = await browser.newPage();
    try {
      await page.goto(result.link, { waitUntil: 'domcontentloaded', timeout: Math.min(timeLimit, endTime - Date.now()) });

      const groupData = await page.evaluate(() => {
        const groups = [];
        document.querySelectorAll('a').forEach(a => {
          const href = a.href;
          if (href.includes('https://chat.whatsapp.com/')) {
            groups.push({ href });
          }
        });
        return groups.length > 0 ? groups : [];
      });

      if (groupData.length > 0) {
        for (const group of groupData) {
          if (Date.now() >= endTime) {
            console.log(`Extraction timeout reached. Stopping further processing.`);
            break;
          }

          const groupName = await fetchWithTimeout(getGroupName(browser, group.href), endTime - Date.now()).catch(() => 'Not Found');
          group.groupName = groupName;
        }
        whatsappGroups.push({
          title: result.title,
          link: result.link,
          groups: groupData.filter(group => group.groupName && group.groupName !== 'Not Found'),
        });
      }
    } catch (error) {
      console.log(`Error processing link ${result.link}: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  return whatsappGroups.filter(group => group.groups.length > 0);
}

// Function to get group name from WhatsApp link
async function getGroupName(browser, url) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 2000 });
    await page.waitForSelector('h3._9vd5._9scr, h4._9vd5._9scb', { timeout: 100 });
    const groupName = await page.evaluate(() => {
      const nameElementH3 = document.querySelector('h3._9vd5._9scr');
      const nameElementH4 = document.querySelector('h4._9vd5._9scb');
      return nameElementH3 ? nameElementH3.innerText : (nameElementH4 ? nameElementH4.innerText : 'Unnamed Group');
    });
    return groupName;
  } catch (error) {
    return 'Not Found';
  } finally {
    await page.close();
  }
}

// Function to wrap a promise with a timeout
function fetchWithTimeout(promise, timeout) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
  ]);
}

// Function to render results as HTML
function renderResults(results) {
  let html = '<h2 class="fw-bolder text-primary text-center pb-3">Search Results</h2>';
  html += '<div class="card shadow-sm p-3">';
  html += '<div class="card-body">';
  html += '<div class="table-responsive">';
  html += '<table class="table table-bordered shadow-sm p-3">';
  html += '<thead>';
  html += '<tr><th class="text-truncate">Title</th><th class="text-truncate">Link</th><th class="text-truncate">Group Name</th><th class="text-truncate">Join Group</th></tr>';
  html += '</thead>';

  const allData = [];

  results.forEach(result => {
    const validGroups = result.groups.filter(group => group.href && group.groupName);
    if (validGroups.length > 0) {
      validGroups.forEach(group => {
        html += `<tr><td class="text-truncate">${result.title}</td>
        <td class="text-truncate"><a href="${result.link}" target="_blank">${result.link}</a></td>
        <td class="text-truncate">${group.groupName}</td>
        <td class="text-truncate"><a class="w-group-join" href="${group.href}" target="_blank">Join</a></td>
        </tr>`;

        allData.push({
          Title: result.title,
          Link: result.link,
          GroupName: group.groupName,
          JoinGroup: group.href
        });
      });
    }
  });

  html += '</table>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += `<input type="hidden" id="allData" value='${JSON.stringify(allData).replace(/'/g, '&#39;')}' />`;
  html += `<script>
    document.getElementById('loading-overlay').style.visibility = 'hidden';
  </script>`;
  return html;
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
