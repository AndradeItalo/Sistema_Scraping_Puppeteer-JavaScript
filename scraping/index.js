const puppeteer = require('puppeteer');
const fs = require('fs'); //usando p salvar os dados no arquivo local

const product = "notebook";
let pag = 1;
const listProduct = [];
const notAvaliation = 'Não foi avaliado.';

(async () => {
    const browser = await puppeteer.launch({
        headless: false, 
        defaultViewport: { width: 1200, height: 800 } // PRECISA ABRIR A TELA TOTALMENTE, SE NÃO DA ERRO POR CONTA DO LAYOUT DA PAGINA DA KABUM.
    });
    const page = await browser.newPage();
  
    //iniciar navegacao
    await page.goto('https://www.kabum.com.br/');
    await page.waitForSelector('#input-busca');
    await page.type('#input-busca', product); //digita na barra de pesquisa

    await Promise.all([ //pega todos os produtos da pagina
        page.waitForNavigation(),
        page.click('.sc-jSgvzq.sc-bkzYnD.bsIXwL.hzpqID')
    ]);
  
    //Site da kabum só tem a paginação na tela principal de listagem de produtos, 
    //sendo assim, preciso pegar a url atual toda vez que clico na próxima página
    let currentUrl = await page.evaluate(() => window.location.href); 

    // Loop principal: Enquanto houver páginas para navegar
    while (pag <= 3) {
      console.log('pagina', pag);
      const links = await page.$$eval('.sc-cdc9b13f-7.gHEmMz.productCard > a', el => el.map(link => link.href)); //PEGAR TODOS OS LINKS DOS PRODUTOS DA PAGINA

      for( const link of links ){
        await page.goto(link);
        await page.waitForSelector('.sc-fdfabab6-6.jNQQeD');
  
        const title = await page.$eval('.sc-fdfabab6-6.jNQQeD', el => el.innerText);
        const price = await page.$eval('.sc-5492faee-2.ipHrwP.finalPrice', el => el.innerText);
        const description = await page.$eval('#iframeContainer', el => el.innerText);
  
        const screenshotPath = `screenshots/${title.replace(/[/\\?%*:|"<>]/g, '')}.png`; // Remove caracteres inválidos para o nome do arquivo
        await page.screenshot({path: screenshotPath});

        //nem sempre o produto tem avaliação, essa função garante que não dará erro quando o produto não tiver avaliação.
        //simplesmente vai tirar isso da array do produto.
        const avaliation = await page.evaluate(() => { 
          const el = document.querySelector('.sc-57aea7be-1.gAjNhT')
          if(!el) return null;
          return el.innerText;
        })
  
        const feedbacks = await page.$$eval('.sc-8841b8a3-0.dINqTS', elements => elements.map(el => el.innerText));
  
        const obj = {};
        obj.title = title;
        obj.price = price;
        obj.description = description;
        (avaliation ? obj.avaliation = avaliation : obj.avaliation = notAvaliation);
        obj.feedbacks = feedbacks;
        obj.link = link;
  
        listProduct.push(obj);
      }

      // Volte para a página de listagem de produtos
      await page.goto(currentUrl); 
      
      // Verifica se existe um botão de próxima página e clica
      const hasNextPage = await page.$('.next');
      if (hasNextPage) {
        await Promise.all([
            page.waitForNavigation(),
            page.click('.next'),
            
        ]);
        currentUrl = await page.url();
        
        } else {
            break; // Sai do loop se não houver próxima página
        }
        pag++;
    }
    
    //transfpormar para JSON
    const jsonData = JSON.stringify(listProduct, null, 2);

    //salva os dados coletados no arquivo .json
    fs.writeFile('products.json', jsonData, (err) => {
      if(err) throw err;

      console.log('dados salvos com sucesso')
    })

    // Close the browser
    await browser.close();
})();
