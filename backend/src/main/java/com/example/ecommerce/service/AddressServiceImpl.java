package com.example.ecommerce.service;

import com.example.ecommerce.dto.AddressRequestDto;
import com.example.ecommerce.dto.AddressResponseDto;
import com.example.ecommerce.entity.Address;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.mapper.AddressMapper;
import com.example.ecommerce.repository.AddressRepository;
import com.example.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponseDto> getAddressesByUserId(Long userId) {
        log.info("Fetching addresses for user: {}", userId);
        return addressRepository.findByUserId(userId).stream()
                .map(AddressMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponseDto getAddressById(Long userId, Long addressId) {
        log.info("Fetching address: User: {}, Address: {}", userId, addressId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));
        
        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this address.");
        }
        return AddressMapper.toResponseDto(address);
    }

    @Override
    @Transactional
    public AddressResponseDto createAddress(Long userId, AddressRequestDto request) {
        log.info("Creating address for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.isDefault()) {
            resetDefaultAddress(userId);
        }

        // If it's the user's first address, force it to be default
        boolean hasAddresses = !addressRepository.findByUserId(userId).isEmpty();
        boolean isDefault = !hasAddresses || request.isDefault();

        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName())
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zip(request.getZip())
                .country(request.getCountry())
                .phone(request.getPhone())
                .isDefault(isDefault)
                .build();

        Address savedAddress = addressRepository.save(address);
        return AddressMapper.toResponseDto(savedAddress);
    }

    @Override
    @Transactional
    public AddressResponseDto updateAddress(Long userId, Long addressId, AddressRequestDto request) {
        log.info("Updating address: User: {}, Address: {}", userId, addressId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to modify this address.");
        }

        if (request.isDefault() && !address.isDefault()) {
            resetDefaultAddress(userId);
        }

        address.setFullName(request.getFullName());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZip(request.getZip());
        address.setCountry(request.getCountry());
        address.setPhone(request.getPhone());
        address.setDefault(request.isDefault());

        Address updatedAddress = addressRepository.save(address);
        return AddressMapper.toResponseDto(updatedAddress);
    }

    @Override
    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        log.info("Deleting address: User: {}, Address: {}", userId, addressId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to delete this address.");
        }

        addressRepository.delete(address);
        
        // If we deleted the default address, set another address as default if list is not empty
        if (address.isDefault()) {
            List<Address> remaining = addressRepository.findByUserId(userId);
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    private void resetDefaultAddress(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId).ifPresent(addr -> {
            addr.setDefault(false);
            addressRepository.save(addr);
        });
    }
}
