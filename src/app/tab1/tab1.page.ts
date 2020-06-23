import { Component, OnInit } from '@angular/core';

import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { ActionSheetController, Platform } from '@ionic/angular';
import {
  MediaCapture,
  MediaFile,
  CaptureError,
} from '@ionic-native/media-capture/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

const MEDIA_FOLDER_NAME = 'my_media';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  files = [];

  constructor(
    private imagenPicker: ImagePicker,
    private mediaCapture: MediaCapture,
    private file: File,
    private media: Media,
    private streamingMedia: StreamingMedia,
    private photoViewer: PhotoViewer,
    private actions: ActionSheetController,
    private plt: Platform
  ) {}

  ngOnInit() {
    this.plt.ready().then(() => {
      const path = this.file.dataDirectory;

      this.file.checkDir(path, MEDIA_FOLDER_NAME).then(
        () => {
          this.loadFiles();
        },
        (err) => {
          this.file.createDir(path, MEDIA_FOLDER_NAME, true).then(() => {
            this.loadFiles();
          });
        }
      );
    });
  }

  loadFiles() {
    this.file
      .listDir(this.file.dataDirectory, MEDIA_FOLDER_NAME)
      .then((res) => {
        this.files = res;
        console.log('files', res);
      });
  }

  async selecionarMedia() {
    const actionSheet = await this.actions.create({
      header: 'Seleccione una opción',
      buttons: [
        {
          text: 'Capturar Imagen',
          handler: () => {
            this.captureImage();
          },
        },
        {
          text: 'Grabar Video',
          handler: () => {
            this.recordVideo();
          },
        },
        {
          text: 'Grabar Audio',
          handler: () => {
            this.recordAudio();
          },
        },
        {
          text: 'Cargar Multimedia',
          handler: () => {
            this.pickImages();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  copyFileToLocalDir(fullPath) {
    console.log('copy now: ', fullPath);

    let myPath = fullPath;

    if (fullPath.indexOf('file://') < 0) {
      myPath = 'file://' + fullPath;
    }

    const ext = myPath.split('.').pop();
    const d = Date.now();
    const newName = `${d}.${ext}`;

    const name = myPath.substr(myPath.lastIndexOf('/') + 1);
    const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
    const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME;

    this.file.copyFile(copyFrom, name, copyTo, newName).then(
      () => {
        this.loadFiles();
      },
      (err) => console.log('Error: ', err)
    );
  }

  captureImage() {
    this.mediaCapture.captureImage().then((data: MediaFile[]) => {
      if (data.length > 0) {
        this.copyFileToLocalDir(data[0].fullPath);
      }
    });
  }
  recordVideo() {
    this.mediaCapture.captureVideo().then((data: MediaFile[]) => {
      if (data.length > 0) {
        this.copyFileToLocalDir(data[0].fullPath);
      }
    });
  }
  recordAudio() {
    this.mediaCapture.captureAudio().then((data: MediaFile[]) => {
      if (data.length > 0) {
        this.copyFileToLocalDir(data[0].fullPath);
      }
    });
  }
  pickImages() {
    this.imagenPicker.getPictures({}).then((results) => {
      console.log('images: ', results);

      for (const result of results) {
        this.copyFileToLocalDir(result);
      }
    });
  }

  openFile(file: FileEntry) {

    if (file.name.indexOf('.wav') > -1  || file.name.indexOf('.mp3') > -1 ){

    const path = file.nativeURL.replace(/^file:\/\//, '');
    const audioFile: MediaObject = this.media.create(path);
    audioFile.play();
    } else if (file.name.indexOf('.MOV') > -1 || file.name.indexOf('.mp4') > -1) {

      this.streamingMedia.playVideo(file.nativeURL);

    } else if (file.name.indexOf('.jpg') > -1 || file.name.indexOf('.png') > -1  ) {

      this.photoViewer.show(file.nativeURL, 'Mi imagen');

    }
  }

  deleteFile(file: FileEntry) {
    const path = file.nativeURL.substr(0, file.nativeURL.lastIndexOf('/') + 1);

    this.file.removeFile(path, file.name).then(
      () => {
        this.loadFiles();
      },
      (err) => console.log('Error delete: ', err)
    );
  }
}
