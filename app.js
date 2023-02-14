(() => {

  const getData = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const pages = searchParams.get('page');
    const response = await fetch(`https://gorest.co.in/public-api/posts?page=${pages == null ? 1 : pages}`);
    const data = await response.json();
    return data;
  }

  const body = document.body;

  const createHeader = () => {
    const container = document.createElement('div');
    const title = document.createElement('span');
    container.classList.add('header');
    title.classList.add('title');
    title.textContent = 'Home';
    container.append(title)

    return container
  }

  const createContainer = () => {
    const container = document.createElement('div');
    container.classList.add('container');
    return container;
  }

  const render = (arr, content) => {
    arr.forEach(el => {
      const post = document.createElement('article');
      post.classList.add('article');

      post.innerHTML = `
        <h3 class="content-title">${el.title}</h3>
        <hr></hr>
        <p class="content-article">${el.body}</p>
        <a class="content-link" href='post.html?id=${el.id}'>More...</a>
      `;
      content.append(post)
    })
  };

  const searchPage = () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <form class="form">
        <button class="btn-prev"><</button>
        <input type="search" class="input" placeholder="On page..."></input>
        <button class="btn-search" type="submit">
          <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 56.966 56.966" style="enable-background:new 0 0 56.966 56.966;" xml:space="preserve">
            <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23
            s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92
            c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17
            s-17-7.626-17-17S14.61,6,23.984,6z"/>
          </svg>
        </button>
        <button class="btn-next">></button>
      </form>
    `;
    return wrapper
  };

  const createPage = () => {
    const head = createHeader();
    const container = createContainer();
    const content = document.createElement('div');
    const aside = document.createElement('aside');
    const preloader = document.createElement('preloader');
    const gif = document.createElement('div');
    const pagination = document.createElement('div');
    const search = searchPage();

    preloader.classList.add('visible');
    preloader.classList.add('preloader');
    pagination.classList.add('pagination');
    gif.classList.add('gif');

    aside.append(pagination);
    aside.append(search);
    preloader.append(gif);
    container.append(preloader);

    function renderPagination(pagesNum) {
      const per_page_max = pagesNum;
      let current_page = window.location.search.substring(6);

      function appendBtn(i, ellipsis) {
        const activeBtn = current_page === i;
        const link = document.createElement('a');

        link.classList.add('post-link');

        if (ellipsis === true) {
          link.innerHTML = '...';
          link.disabled = true;
          link.style = 'background: none; cursor: default;'
          pagination.append(link);
          return false;
        }

        if (activeBtn) {
          link.classList.add('active');
        }

        link.disabled = activeBtn === true ? 'disabled' : '';
        link.innerHTML = i;
        link.setAttribute('href', `index.html?page=${i}`);

        link.addEventListener('click', async () => {
          getData()
            .then(data => {
              render(data.data, content);

              current_page = i;
              pagination.innerHTML = '';
              logic(1, 1, 3);

              preloader.classList.remove('visible');
              preloader.classList.add('hidden');
            });
        });

        pagination.append(link);
      };

      logic(1, 1, 3);

      function logic(leftCount, centerSideCount, rightCount) {
        let centerLeft, centerRight;

        range(1, leftCount).forEach(appendBtn);

        centerLeft = Math.max(leftCount + 1, current_page - centerSideCount);
        centerRight = Math.min(per_page_max - rightCount, centerLeft + centerSideCount * 2);
        centerLeft = Math.max(leftCount + 1, centerRight - centerSideCount * 2);

        if (centerLeft > leftCount + 1) {
          appendBtn(current_page, true);
        }

        range(centerLeft, centerRight).forEach(appendBtn);

        if (centerRight < per_page_max - rightCount) {
          appendBtn(current_page, true);
        }

        range(per_page_max - rightCount + 1, per_page_max).forEach(appendBtn);
      };

      function range(start, stop) {
        if (start === undefined || stop === undefined) return [];

        const length = Math.abs(stop - start) + 1;

        return Array.from({
          length
        }, (_, i) => i * Math.sign(stop - start) + start);
      };
    };

    getData()
      .then(data => {
        render(data.data, content);
        renderPagination(data.meta.pagination.pages);
        preloader.classList.add('hidden');
        preloader.classList.remove('visible');
      });

    content.classList.add('content');
    aside.classList.add('aside');

    container.append(content);
    container.append(aside);

    body.append(head);
    body.append(container);
  }

  document.addEventListener('DOMContentLoaded', () => {
    createPage();
    const input = document.querySelector('.input');
    const submit = document.querySelector('.btn-search');
    const content = document.querySelector('.content');
    const preloader = document.querySelector('.preloader');

    submit.addEventListener('click', async e => {
      e.preventDefault();

      getData()
        .then(data => {
          if (input.value !== '' && input.value < data.meta.pagination.pages) {
            content.innerHTML = '';
            preloader.classList.remove('hidden');
            preloader.classList.add('visible');

            setTimeout(() => {
              preloader.classList.add('hidden');
              preloader.classList.remove('visible');
            }, 500);

            render(data.data, content);
            renderPagination(data.meta.pagination.pages);

            input.value = "";
          } else {
            input.classList.add('error');

            setTimeout(() => {
              input.classList.remove('error');
            }, 1000);
          }
        });
    });

  });
})();
