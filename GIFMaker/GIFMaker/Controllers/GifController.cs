using System.Collections.Generic;
using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace GIFMaker.Controllers
{
    public class GifController : Controller
    {
        // GET
        [HttpGet]
        public IActionResult Home()
        {
            //Toont home pagina
            return Ok(200);
        }

        [HttpGet("{id}")]
        public IActionResult Item()
        {
            //Get request naar bucket link aws.bucket.com/{id}
            
            return Ok(200);
        }

        [HttpPost]
        public IActionResult CreateGif()
        {
            //Upload afbeeldingen naar externe API response moet gecaptured worden === GIF
            List<string> inputImageUrls;
            string outputImageUrl;
            return Ok(201);
        }
    }
}