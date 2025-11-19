import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { FileStorageService } from '../../services/file-storage.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class SettingsPage implements OnInit {
  files: string[] = [];
  isLoading = false;

  constructor(
    private fileStorage: FileStorageService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadFiles();
  }

  async loadFiles() {
    this.isLoading = true;
    this.files = await this.fileStorage.listFiles();
    this.isLoading = false;
  }

  async createBackup() {
    this.isLoading = true;
    try {
      const fileName = await this.fileStorage.exportAllData();
      this.showToast(`Backup criado: ${fileName}`, 'success');
      await this.loadFiles();
    } catch (error) {
      this.showToast('Erro ao criar backup', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async restoreBackup(fileName: string) {
    const alert = await this.alertController.create({
      header: 'Restaurar Backup',
      message: 'Tem certeza? Isso vai sobrescrever os dados atuais.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Restaurar',
          handler: async () => {
            this.isLoading = true;
            try {
              await this.fileStorage.importFromBackup(fileName);
              this.showToast('Backup restaurado com sucesso', 'success');
            } catch (error) {
              this.showToast('Erro ao restaurar backup', 'danger');
            } finally {
              this.isLoading = false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteBackup(fileName: string) {
    const alert = await this.alertController.create({
      header: 'Deletar Arquivo',
      message: `Deseja deletar ${fileName}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Deletar',
          handler: async () => {
            try {
              await this.fileStorage.deleteFile(fileName);
              this.showToast('Arquivo deletado', 'success');
              await this.loadFiles();
            } catch (error) {
              this.showToast('Erro ao deletar arquivo', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}