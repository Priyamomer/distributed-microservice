//package com.example.userservice;
//
//import com.example.userservice.security.repositories.JpaRegisteredClientRepository;
//import jakarta.inject.Inject;
//import org.junit.jupiter.api.Test;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.oauth2.core.AuthorizationGrantType;
//import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
//import org.springframework.security.oauth2.core.oidc.OidcScopes;
//import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
//import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
//import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
//import org.springframework.test.annotation.Commit;
//
//import java.util.UUID;
//
//@SpringBootTest
//class UserServiceApplicationTests {
//	@Inject
//	JpaRegisteredClientRepository jpaRegisteredClientRepository;
//	@Inject
//	BCryptPasswordEncoder bCryptPasswordEncoder;
//
//	@Test
//	@Commit
//	void contextLoads() {
//		RegisteredClient oidcClient = RegisteredClient.withId(UUID.randomUUID().toString())
//				.clientId("productService")
//				//.clientId("client")
//				.clientSecret(bCryptPasswordEncoder.encode("productServiceSecret"))
//				.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
//				.authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
//				.authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
//				.authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
//				//.redirectUri("http://127.0.0.1:8080/login/oauth2/code/oidc-client")
//				//.redirectUri("https://google.com")
//				.redirectUri("https://oauth.pstmn.io/v1/callback")
//				//.redirectUri("http://localhost:500/authorized")
//				//.postLogoutRedirectUri("http://127.0.0.1:8080/")
//				.scope(OidcScopes.OPENID)
////				.scope(OidcScopes.PROFILE)
//				.scope(OidcScopes.EMAIL)
////				.scope(OidcScopes.ADDRESS)
//				.clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())
//				.build();
//		jpaRegisteredClientRepository.save(oidcClient);
//	}
//
//}
