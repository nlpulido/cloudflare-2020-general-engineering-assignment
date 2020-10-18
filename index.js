const data = require('./data.json')
const staticPage = 'https://static-links-page.signalnerve.workers.dev'

class ActivateDivs {
  async element(element) {
      /* display the div if initially invisible */
      if (element.hasAttribute('style')) {
          element.removeAttribute('style')
      }
  }
}

class InsertLinks {
  constructor(elementID, links) {
    this.elementID = elementID
    this.links = JSON.parse(links)
  }

  /**
   * Build an anchor element with the link passed in.
   * @param String link
   */
  buildAnchorElement(link) {
    return '<a href=\"' + link.url + '\">' + link.name + "</a>"
  }

  async element(element) {
    /* insert each link into the appropriate div */
    if (element.getAttribute('id') == this.elementID) {
      for (var counter in this.links) {
        var a = this.buildAnchorElement(this.links[counter])
        element.append(a, {html : true})
      }
    }
  }

}

class UpdateImage {
  constructor(elementID, image) {
    this.elementID = elementID
    this.avatar = JSON.parse(image)
  }

  async element(element) {
    /* update the src attribute to be the avatar link */
    if (element.getAttribute('id') == this.elementID) {
      element.setAttribute('src', this.avatar)
    }
  }
}

class UpdateName {
  constructor(elementID, name) {
    this.elementID = elementID
    this.name = JSON.parse(name)
  }

  async element(element) {
    /* update the element's innerHTML to be the name inputted */
    if (element.getAttribute('id') == this.elementID) {
      element.setInnerContent(this.name)
    }
  }
}

class UpdateTitle {
  constructor(name) {
    this.name = JSON.parse(name)
  }

  async element(element) {
    /* update the title tag to be the name passed in*/
    element.setInnerContent(this.name)
  }
}

class UpdateBackgroundColor {
  constructor(color) {
    this.color = JSON.parse(color)
  }

  async element(element) {
    /* update the class element to be the correct color*/
    element.setAttribute('class', this.color)
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Determine what response to return based off the page path
 * @param {Request} request
 */
function linksHandler(request) {
  const init = {
      headers: { 'content-type': 'application/json' },
  }
  const body = JSON.stringify(data['links'])
  return new Response(body, init)
}

/**
 * Determine what response to return based off the page path
 * @param {Request} request
 */
async function handleRequest(request) {
  const path = new URL(request.url).pathname.toLowerCase()
  const rewriter = new HTMLRewriter()
    .on('div', new ActivateDivs())
    .on('div', new InsertLinks('links', JSON.stringify(data['links'])))
    .on('img', new UpdateImage('avatar', JSON.stringify(data['avatar'])))
    .on('h1', new UpdateName('name', JSON.stringify(data['name'])))
    .on('title', new UpdateTitle(JSON.stringify(data['name'])))
    .on('body', new UpdateBackgroundColor(JSON.stringify(data['background-color'])))

  if (path == '/links') {
    return linksHandler(request)
  } else {
    const res = await fetch(staticPage)
    return rewriter.transform(res)
  }
}
