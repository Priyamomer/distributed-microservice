package com.example.userservice.services;

import com.example.userservice.dtos.UserDto;
import com.example.userservice.exception.InvalidParameterException;
import com.example.userservice.exception.InvalidRequestException;
import com.example.userservice.models.Role;
import com.example.userservice.models.Session;
import com.example.userservice.models.SessionStatus;
import com.example.userservice.models.User;
import com.example.userservice.repositories.RoleRepository;
import com.example.userservice.repositories.SessionRepository;
import com.example.userservice.repositories.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.MacAlgorithm;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMapAdapter;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.*;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    public AuthService(UserRepository userRepository,
                       SessionRepository sessionRepository,
                       RoleRepository roleRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.roleRepository = roleRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    public ResponseEntity<UserDto> login(String email,String password) throws InvalidRequestException, InvalidParameterException {
        Optional<User> userOptional= userRepository.findByEmail(email);
        if(userOptional.isEmpty()){
            throw new InvalidRequestException("User-do-not-exist");
        }
        String encodedPassword=userOptional.get().getPassword();
        if(!bCryptPasswordEncoder.matches(password,encodedPassword)){
            throw new InvalidParameterException("Wrong password");
        }
        User user=userOptional.get();


        String token= RandomStringUtils.randomAlphanumeric(30);

        MacAlgorithm alg= Jwts.SIG.HS256;
        SecretKey key=alg.key().build();

        byte[]keyByptes= key.getEncoded();
        System.out.println(Arrays.toString(keyByptes));

        String keyBase64 = Base64.getEncoder().encodeToString(key.getEncoded());
        System.out.println("KeyBase64"+keyBase64);


        Date now = new Date();
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        calendar.setTime(now);
        calendar.add(Calendar.DAY_OF_YEAR, 30);
        Date thirtyDaysLater = calendar.getTime();

        Map<String,Object> jsonMap=new HashMap<>();
        jsonMap.put("email",user.getEmail());
        jsonMap.put("roles",List.of(user.getRoles()));
        jsonMap.put("createdAt",new Date());
        jsonMap.put("expiryAt",thirtyDaysLater);

        String jws=Jwts.builder().claims(jsonMap).signWith(key,alg).compact();

        Session session=new Session();
        session.setSessionStatus(SessionStatus.ACTIVE);
        session.setToken(jws);
        session.setUser(user);
        session.setExpiringAt(thirtyDaysLater);

        sessionRepository.save(session);

        MultiValueMapAdapter<String,String> headers=new MultiValueMapAdapter<>(new HashMap<>());
        headers.add(HttpHeaders.SET_COOKIE,"auth-token:"+jws);
        ResponseEntity<UserDto> response=new ResponseEntity<>(UserDto.from(user), headers, HttpStatus.OK);
        return response;
    }
    public ResponseEntity<UserDto> signUp(String email,String password) throws InvalidParameterException {
        Optional<User> userOptional= userRepository.findByEmail(email);
        if(userOptional.isPresent()){
            throw new InvalidParameterException("User Already Exists");
        }
        User user=new User();
        user.setEmail(email);
        user.setPassword(bCryptPasswordEncoder.encode(password));

        userRepository.save(user);
        return new ResponseEntity<>(UserDto.from(user),HttpStatus.OK);
    }

    public ResponseEntity<Void> logout(Long userId, String token) throws InvalidParameterException{
        Optional<Session> sessionOptional=sessionRepository.findByToken(token);
        if(sessionOptional.isEmpty()){
            throw new InvalidParameterException("invalid session");
        }
        Session session= sessionOptional.get();
        sessionRepository.save(session);
        session.setSessionStatus(SessionStatus.ENDED);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<SessionStatus> validateToken(Long userId,String token) throws InvalidParameterException {
        Optional<Session> sessionOptional= sessionRepository.findByTokenAndUser_Id(token,userId);
        if(sessionOptional.isEmpty()){
            throw new InvalidParameterException("Invalid sessiontoken-userId");
        }
        Session session = sessionOptional.get();
        if(!session.getSessionStatus().equals(SessionStatus.ACTIVE)){
            return new ResponseEntity<>(SessionStatus.ENDED,HttpStatus.OK);
        }
        Date now = new Date();
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        calendar.setTime(now);

        if(session.getExpiringAt().before(now)){
            return new ResponseEntity<>(SessionStatus.ENDED,HttpStatus.OK);
        }

//        Jws<Claims> jwsClaims = Jwts.parser().build().parseSignedClaims(token);
//        String email=(String) jwsClaims.getPayload().get("email");


//        if(restrictedEmails.contains(email)){
//            //Reject the token
//        }


        ResponseEntity<SessionStatus> response = new ResponseEntity<>(sessionOptional.get().getSessionStatus(),HttpStatus.OK);
        return response;
    }
    public String changeUserPassword(String email, String oldPassword,String newPassword) throws InvalidParameterException {
        User user=userRepository.findByEmail(email).orElseThrow(()-> new InvalidParameterException("No such user exists"));
        if(bCryptPasswordEncoder.matches(oldPassword,user.getPassword())){
            user.setPassword(bCryptPasswordEncoder.encode(newPassword));
            userRepository.save(user);
            return "Password Change Successfully";
        }else{
            throw new InvalidParameterException("Wrong Old Password");
        }

    }
}
