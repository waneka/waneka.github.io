var app = (function () {
  var pixabayPublicKey = '4424166-feb46d87eba60cf69cbaa833f';
  var pageCounter = 1;
  var allPhotos = [];
  var expandedPhotoIndex = undefined;

  function incrementExpandedIndex() {
    expandedPhotoIndex ++;
  }

  function decrementExpandedIndex() {
    expandedPhotoIndex --;
  }

  function expandImageByIndex(index) {
    index = index !== null ? index : expandedPhotoIndex;
    var photoToExpand = allPhotos[index];
    var expandedPhotoContainer = document.getElementById('expanded-photo-container');
    var expandedImgEl = document.getElementById('expanded-image');
    var leftArrow = document.getElementById('left-arrow');
    var rightArrow = document.getElementById('right-arrow');
    var description = document.getElementById('photo-description');

    expandedImgEl.src = photoToExpand.webformatURL;

    expandedImgEl.addEventListener('load', function () {
      expandedPhotoContainer.classList.remove('hide');

      leftArrow.className = 'arrow--left';
      rightArrow.className = 'arrow--right';

      description.innerHTML = photoToExpand.tags;

      if (index > 0) {
        leftArrow.classList.remove('hide');
      } else {
        leftArrow.classList.add('hide');
      }

      if (index < allPhotos.length - 1) {
        rightArrow.classList.remove('hide');
      } else {
        rightArrow.classList.add('hide');
      }

      expandedPhotoIndex = index;
    });
  }

  function closeExpandedPhoto(e) {
    if (expandedPhotoIndex && !e.target.closest('#expanded-photo')) {
      var expandedPhotoContainer = document.getElementById('expanded-photo-container');
      var expandedImgEl = document.getElementById('expanded-image');
      expandedPhotoContainer.classList.add('hide');
      expandedImgEl.src = '';
      expandedPhotoIndex = undefined;
    }
  }

  function toggleLoader(show) {
    var loader = document.getElementById('loader');

    if (show) {
      loader.classList.add('is-showing');
      loader.classList.remove('is-hiding');
    } else {
      loader.classList.add('is-hiding');
      loader.classList.remove('is-showing');
    }
  }

  function handleResponseData(responseData) {
    var photos = responseData.hits;
    var photo;
    var currentPhotosLength = allPhotos.length;
    var batchedImages = [];
    var batchedCounter = 0;

    photos.forEach(function (photo, index) {

      allPhotos.push(photo);

      var photoFragment = document.createDocumentFragment();
      var thumbnail = document.createElement('div');
      var imgEl = document.createElement('img');
      thumbnail.className = 'grid__item col-1-8 flex ai--c';
      imgEl.src = photo.previewURL;
      imgEl.className = 'thumbnail--image'

      imgEl.addEventListener('click', expandImageByIndex.bind(this, currentPhotosLength + index));

      thumbnail.appendChild(imgEl);
      photoFragment.appendChild(thumbnail);
      batchedImages.push(photoFragment);

      imgEl.addEventListener('load', function () {
        batchedCounter ++;
        if (batchedCounter === photos.length) {
          renderBatchedImages(batchedImages);
          toggleLoader(false);
        }
      });
    });
  }

  function renderBatchedImages(fragments) {
    var thumbnailsContainer = document.getElementById('thumbnails');

    fragments.forEach(function (fragment) {
      thumbnailsContainer.appendChild(fragment);
    });
  }

  function fetchPhotos() {
    toggleLoader(true);
    var photoRequest = new XMLHttpRequest();
    var endpoint;
    var responseData;

    photoRequest.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
          responseData = JSON.parse(this.responseText);
          handleResponseData(responseData);
        } else {
          // display error
        }
      }
    }

    endpoint = 'https://pixabay.com/api/?key=' + pixabayPublicKey + '&orientation=horizontal&per_page=50&page=' + pageCounter;
    photoRequest.open('GET', endpoint);
    photoRequest.send();
    pageCounter ++;
  }

  function bindEventListeners() {
    var leftArrow = document.getElementById('left-arrow');
    var rightArrow = document.getElementById('right-arrow');
    var fetchMoreButton = document.getElementById('fetchMorePhotos');

    leftArrow.addEventListener('click', function () {
      decrementExpandedIndex();
      expandImageByIndex(null);
    })
    rightArrow.addEventListener('click', function () {
      incrementExpandedIndex();
      expandImageByIndex(null);
    })
    fetchMoreButton.addEventListener('click', fetchPhotos);

    document.addEventListener('click', closeExpandedPhoto);
  }

  function init() {
    fetchPhotos();
    bindEventListeners();
  }

  return {
    init: init,
  }
})();

app.init();
