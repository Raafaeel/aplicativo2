import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { SettingsPage } from './settings.page';
import { FileStorageService } from '../../services/file-storage.service';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  let fileStorageService: jasmine.SpyObj<FileStorageService>;
  let alertController: jasmine.SpyObj<AlertController>;
  let toastController: jasmine.SpyObj<ToastController>;

  beforeEach(async () => {
    // Criar mocks dos serviços
    const fileStorageSpy = jasmine.createSpyObj('FileStorageService', [
      'listFiles',
      'exportAllData',
      'importFromBackup',
      'deleteFile'
    ]);

    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [IonicModule.forRoot(), SettingsPage],
      providers: [
        { provide: FileStorageService, useValue: fileStorageSpy },
        { provide: AlertController, useValue: alertSpy },
        { provide: ToastController, useValue: toastSpy }
      ]
    }).compileComponents();

    fileStorageService = TestBed.inject(FileStorageService) as jasmine.SpyObj<FileStorageService>;
    alertController = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load files on init', async () => {
      fileStorageService.listFiles.and.returnValue(Promise.resolve(['file1.json', 'file2.json']));

      await component.ngOnInit();

      expect(fileStorageService.listFiles).toHaveBeenCalled();
      expect(component.files.length).toBe(2);
      expect(component.isLoading).toBeFalsy();
    });

    it('should handle empty file list', async () => {
      fileStorageService.listFiles.and.returnValue(Promise.resolve([]));

      await component.ngOnInit();

      expect(component.files).toEqual([]);
      expect(component.isLoading).toBeFalsy();
    });
  });

  describe('loadFiles', () => {
    it('should set isLoading to true during load', async () => {
      fileStorageService.listFiles.and.returnValue(new Promise(resolve => {
        setTimeout(() => resolve(['backup1.json']), 100);
      }));

      const loadPromise = component.loadFiles();
      expect(component.isLoading).toBeTruthy();

      await loadPromise;
      expect(component.isLoading).toBeFalsy();
    });

    it('should populate files array', async () => {
      const mockFiles = ['backup_2024.json', 'backup_2025.json'];
      fileStorageService.listFiles.and.returnValue(Promise.resolve(mockFiles));

      await component.loadFiles();

      expect(component.files).toEqual(mockFiles);
    });
  });

  describe('createBackup', () => {
    it('should create a backup successfully', async () => {
      const mockFileName = 'backup_1234567890.json';
      fileStorageService.exportAllData.and.returnValue(Promise.resolve(mockFileName));
      fileStorageService.listFiles.and.returnValue(Promise.resolve([mockFileName]));

      const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
      toastController.create.and.returnValue(Promise.resolve(mockToast));

      await component.createBackup();

      expect(fileStorageService.exportAllData).toHaveBeenCalled();
      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: `Backup criado: ${mockFileName}`,
          color: 'success'
        })
      );
      expect(mockToast.present).toHaveBeenCalled();
    });

    it('should handle backup creation error', async () => {
      fileStorageService.exportAllData.and.returnValue(Promise.reject('Error creating backup'));

      const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
      toastController.create.and.returnValue(Promise.resolve(mockToast));

      await component.createBackup();

      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Erro ao criar backup',
          color: 'danger'
        })
      );
    });

    it('should set isLoading to false after backup creation', async () => {
      fileStorageService.exportAllData.and.returnValue(Promise.resolve('backup.json'));
      fileStorageService.listFiles.and.returnValue(Promise.resolve(['backup.json']));
      toastController.create.and.returnValue(Promise.resolve(jasmine.createSpyObj('Toast', ['present'])));

      await component.createBackup();

      expect(component.isLoading).toBeFalsy();
    });
  });

  describe('restoreBackup', () => {
    it('should show confirmation alert', async () => {
      const mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
      alertController.create.and.returnValue(Promise.resolve(mockAlert));

      await component.restoreBackup('backup.json');

      expect(alertController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          header: 'Restaurar Backup',
          message: 'Tem certeza? Isso vai sobrescrever os dados atuais.'
        })
      );
      expect(mockAlert.present).toHaveBeenCalled();
    });

    it('should restore backup on confirmation', async () => {
      const mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
      let alertHandler: Function;

      alertController.create.and.callFake((options: any) => {
        alertHandler = options.buttons[1].handler;
        return Promise.resolve(mockAlert);
      });

      fileStorageService.importFromBackup.and.returnValue(Promise.resolve({}));
      toastController.create.and.returnValue(Promise.resolve(jasmine.createSpyObj('Toast', ['present'])));

      await component.restoreBackup('backup.json');
      await alertHandler!();

      expect(fileStorageService.importFromBackup).toHaveBeenCalledWith('backup.json');
    });

    it('should handle restore error', async () => {
      const mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
      let alertHandler: Function;

      alertController.create.and.callFake((options: any) => {
        alertHandler = options.buttons[1].handler;
        return Promise.resolve(mockAlert);
      });

      fileStorageService.importFromBackup.and.returnValue(Promise.reject('Restore failed'));
      toastController.create.and.returnValue(Promise.resolve(jasmine.createSpyObj('Toast', ['present'])));

      await component.restoreBackup('backup.json');
      await alertHandler!();

      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Erro ao restaurar backup',
          color: 'danger'
        })
      );
    });
  });

  describe('deleteBackup', () => {
    it('should show delete confirmation alert', async () => {
      const mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
      alertController.create.and.returnValue(Promise.resolve(mockAlert));

      await component.deleteBackup('backup.json');

      expect(alertController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          header: 'Deletar Arquivo',
          message: 'Deseja deletar backup.json?'
        })
      );
      expect(mockAlert.present).toHaveBeenCalled();
    });

    it('should delete file on confirmation', async () => {
      const mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
      let alertHandler: Function;

      alertController.create.and.callFake((options: any) => {
        alertHandler = options.buttons[1].handler;
        return Promise.resolve(mockAlert);
      });

      fileStorageService.deleteFile.and.returnValue(Promise.resolve());
      fileStorageService.listFiles.and.returnValue(Promise.resolve([]));
      toastController.create.and.returnValue(Promise.resolve(jasmine.createSpyObj('Toast', ['present'])));

      await component.deleteBackup('backup.json');
      await alertHandler!();

      expect(fileStorageService.deleteFile).toHaveBeenCalledWith('backup.json');
    });

    it('should handle delete error', async () => {
      const mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
      let alertHandler: Function;

      alertController.create.and.callFake((options: any) => {
        alertHandler = options.buttons[1].handler;
        return Promise.resolve(mockAlert);
      });

      fileStorageService.deleteFile.and.returnValue(Promise.reject('Delete failed'));
      toastController.create.and.returnValue(Promise.resolve(jasmine.createSpyObj('Toast', ['present'])));

      await component.deleteBackup('backup.json');
      await alertHandler!();

      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Erro ao deletar arquivo',
          color: 'danger'
        })
      );
    });

    it('should reload files after successful deletion', async () => {
      const mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
      let alertHandler: Function;

      alertController.create.and.callFake((options: any) => {
        alertHandler = options.buttons[1].handler;
        return Promise.resolve(mockAlert);
      });

      fileStorageService.deleteFile.and.returnValue(Promise.resolve());
      fileStorageService.listFiles.and.returnValue(Promise.resolve(['other_backup.json']));
      toastController.create.and.returnValue(Promise.resolve(jasmine.createSpyObj('Toast', ['present'])));

      await component.deleteBackup('backup.json');
      await alertHandler!();

      expect(component.files).toContain('other_backup.json');
    });
  });

  describe('showToast', () => {
    it('should create toast with correct parameters', async () => {
      const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
      toastController.create.and.returnValue(Promise.resolve(mockToast));

      // Acessar o método privado através de any
      await (component as any).showToast('Test message', 'success');

      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Test message',
          color: 'success',
          duration: 2000,
          position: 'bottom'
        })
      );
      expect(mockToast.present).toHaveBeenCalled();
    });

    it('should display danger toast for errors', async () => {
      const mockToast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
      toastController.create.and.returnValue(Promise.resolve(mockToast));

      await (component as any).showToast('Error occurred', 'danger');

      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          color: 'danger'
        })
      );
    });
  });

  describe('Component State', () => {
    it('should initialize with empty files array', () => {
      expect(component.files).toEqual([]);
    });

    it('should initialize with isLoading false', () => {
      expect(component.isLoading).toBeFalsy();
    });

    it('should have all required methods', () => {
      expect(typeof component.loadFiles).toBe('function');
      expect(typeof component.createBackup).toBe('function');
      expect(typeof component.restoreBackup).toBe('function');
      expect(typeof component.deleteBackup).toBe('function');
      expect(typeof component.ngOnInit).toBe('function');
    });
  });
});