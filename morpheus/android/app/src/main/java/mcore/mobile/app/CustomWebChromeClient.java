package mcore.mobile.app;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Build;
import android.webkit.PermissionRequest;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.Arrays;

import m.client.android.library.core.bridge.InterfaceJavascript;
import m.client.android.library.core.managers.CallBackWebView;
import m.client.android.library.core.utils.Logger;
import m.client.android.library.core.view.MainActivity;

public class CustomWebChromeClient extends CallBackWebView {

    public interface PermissionHost {
        int REQ_CODE_MEDIA = 1001;
        void setPendingWebPermission(PermissionRequest req);
        PermissionRequest getPendingWebPermission();
        Activity getHostActivity();
    }

    private final PermissionHost host;

    public CustomWebChromeClient(MainActivity _callerObject, InterfaceJavascript IFjscript) {
        super(_callerObject, IFjscript);
        if (!(_callerObject instanceof PermissionHost)) {
            throw new IllegalStateException("MainActivity must implement PermissionHost");
        }
        this.host = (PermissionHost) _callerObject;
    }

    @Override
    public void onPermissionRequest(final PermissionRequest request) {
        Logger.e("(onPermissionRequest) resources=" + Arrays.toString(request.getResources()));

        // WebView 콜백은 UI 스레드에서 처리
        host.getHostActivity().runOnUiThread(() -> {
            boolean needsCam = hasResource(request, PermissionRequest.RESOURCE_VIDEO_CAPTURE);
            boolean needsMic = hasResource(request, PermissionRequest.RESOURCE_AUDIO_CAPTURE);

            // 안드로이드 OS 권한 체크
            Activity activity = host.getHostActivity();
            boolean camGranted = !needsCam || ContextCompat.checkSelfPermission(activity, Manifest.permission.CAMERA)
                    == PackageManager.PERMISSION_GRANTED;
            boolean micGranted = !needsMic || ContextCompat.checkSelfPermission(activity, Manifest.permission.RECORD_AUDIO)
                    == PackageManager.PERMISSION_GRANTED;

            if (camGranted && micGranted) {
                // OS 권한 이미 OK → 웹 오리진에 권한 부여
                request.grant(request.getResources());
                return;
            }

            // 부족한 권한만 요청
            ArrayList<String> needPerms = new ArrayList<>();
            if (needsCam && !camGranted) needPerms.add(Manifest.permission.CAMERA);
            if (needsMic && !micGranted) needPerms.add(Manifest.permission.RECORD_AUDIO);

            host.setPendingWebPermission(request);
            ActivityCompat.requestPermissions(activity,
                    needPerms.toArray(new String[0]),
                    PermissionHost.REQ_CODE_MEDIA);
        });
    }

    @Override
    public void onPermissionRequestCanceled(PermissionRequest request) {
        Logger.e("(onPermissionRequestCanceled)");
        PermissionRequest pending = host.getPendingWebPermission();
        if (pending == request) {
            host.setPendingWebPermission(null);
        }
        super.onPermissionRequestCanceled(request);
    }

    private boolean hasResource(PermissionRequest req, String target) {
        for (String r : req.getResources()) if (r.equals(target)) return true;
        return false;
    }
}
