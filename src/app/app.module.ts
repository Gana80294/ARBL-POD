import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule, MatIconModule, MatSnackBar, MatSnackBarModule, MatDialogModule, MatToolbarModule, MAT_DATE_LOCALE, MatTableModule, MatPaginator, MatSortModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTabsModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import 'hammerjs';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';

import { fuseConfig } from 'app/fuse-config';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { NotificationSnackBarComponent } from './notifications/notification-snack-bar/notification-snack-bar.component';
import { DatePipe } from '@angular/common';
import { NotificationDialogComponent } from './notifications/notification-dialog/notification-dialog.component';
import { WINDOW_PROVIDERS } from './window.providers';
import { ModifyLayoutComponent } from './allModules/ModifyLayout/modify-layout/modify-layout.component';
import { ReactiveFormsModule } from '@angular/forms';

import {MatCheckboxModule} from '@angular/material/checkbox';
import { UserCreationErrorLogComponent } from './allModules/master/user/user-creation-error-log/user-creation-error-log.component';
import { SelectAutocompleteModule } from 'mat-select-autocomplete';
import { SearchableMultiSelectComponent } from './CustomControls/searchable-multi-select/searchable-multi-select.component';
import { AttachmentDialogComponent } from './allModules/reports/attachment-dialog/attachment-dialog.component';
import { BnNgIdleService } from "bn-ng-idle";



const appRoutes: Routes = [
    {
        path: 'auth',
        loadChildren: './allModules/authentication/authentication.module#AuthenticationModule',
    
    },
    {
        path: 'pages',
        loadChildren: './allModules/pages/pages.module#PagesModule'
    },
    {
        path: 'master',
        loadChildren: './allModules/master/master.module#MasterModule'
    },
    {
        path: 'reports',
        loadChildren: './allModules/reports/reports.module#ReportsModule'
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];

@NgModule({
    declarations: [
        AppComponent,
        NotificationSnackBarComponent,
        NotificationDialogComponent,
        ModifyLayoutComponent,
        UserCreationErrorLogComponent,
        AttachmentDialogComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        RouterModule.forRoot(appRoutes, {
            preloadingStrategy: PreloadAllModules,
            useHash: true,
        }),

        TranslateModule.forRoot(),

        // Material moment date module
        MatMomentDateModule,
        InfiniteScrollModule,

        // Material
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatToolbarModule,
        MatCheckboxModule,
        MatTabsModule,
        // Fuse modules

        SelectAutocompleteModule,
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,

        // App modules
        LayoutModule,
      
    ],
    providers: [
        DatePipe,
        WINDOW_PROVIDERS,
        { provide: MAT_DATE_LOCALE, useValue: "en-IN" },
        BnNgIdleService,
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        NotificationDialogComponent,
        ModifyLayoutComponent,
        UserCreationErrorLogComponent,
        AttachmentDialogComponent,
    ],
})
export class AppModule {}
