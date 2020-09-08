package com.geektime.rnonesignalandroid;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class RNNotificationJob extends ReactContextBaseJavaModule {
   public additionalData;
   private notificationJob;

   RNNotificationJob(AppNotificationGenerationJob notificationJob) {
      JSONObject additionalData = notificationJob.getAdditionalData();
      this.notificationJob = notificationJob;
   }

   @ReactMethod
   public JSONObject

   @ReactMethod
   public void complete(WhateverObject object){
      // mapping
      this.notificationJob.complete(object);
   }
}