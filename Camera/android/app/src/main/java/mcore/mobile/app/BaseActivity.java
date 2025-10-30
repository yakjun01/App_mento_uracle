package mcore.mobile.app;

import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.webkit.PermissionRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.annotation.NonNull;

import m.client.android.library.core.bridge.InterfaceJavascript;
import m.client.android.library.core.customview.MPWebView;
import m.client.android.library.core.utils.Logger;
import m.client.android.library.core.view.MainActivity;

public class BaseActivity extends MainActivity implements CustomWebChromeClient.PermissionHost {

	private PermissionRequest pendingWebPermission;

	// ===== PermissionHost 구현 =====
	@Override
	public void setPendingWebPermission(PermissionRequest req) {
		this.pendingWebPermission = req;
	}

	@Override
	public PermissionRequest getPendingWebPermission() {
		return pendingWebPermission;
	}

	@Override
	public BaseActivity getHostActivity() {
		return this;
	}
	// ==============================

	@Override
	protected MPWebView setWebView() {
		MPWebView mpWebView = super.setWebView();
		WebSettings settings = mpWebView.getSettings();
		settings.setDomStorageEnabled(true);
		settings.setMediaPlaybackRequiresUserGesture(false);
		mpWebView.setWebChromeClient(new CustomWebChromeClient(this, getCurrentWNInterfaceManager().getInterfaceJS()));
		return mpWebView;
	}

	/**
	 * WebView가 시작 될 때 호출되는 함수
	 */
	@Override
	public void onPageStarted(WebView view, String url, Bitmap favicon) {
		super.onPageStarted(view, url, favicon);
	}

	/**
	 * WebView 내 컨텐츠가 로드되고 난 후 호출되는 함수
	 */
	@Override
	public void onPageFinished(WebView view, String url)  {
		super.onPageFinished(view, url);
	}

	// 런타임 권한 결과 처리: 여기서만 grant/deny
	@Override
	public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
										   @NonNull int[] grantResults) {
		super.onRequestPermissionsResult(requestCode, permissions, grantResults);

		if (requestCode == REQ_CODE_MEDIA) {
			boolean allGranted = true;
			for (int r : grantResults) {
				allGranted &= (r == PackageManager.PERMISSION_GRANTED);
			}

			if (pendingWebPermission != null) {
				if (allGranted) {
					Logger.e("(onRequestPermissionsResult) all granted → web grant");
					try {
						pendingWebPermission.grant(pendingWebPermission.getResources());
					} catch (Throwable t) {
						Logger.e("grant failed: " + t.getMessage());
						pendingWebPermission.deny();
					}
				} else {
					Logger.e("(onRequestPermissionsResult) denied → web deny");
					pendingWebPermission.deny();
				}
				pendingWebPermission = null;
			}
		}
	}
}
